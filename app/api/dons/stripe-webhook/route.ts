import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Prisma, ReceiptStatus, UserRole } from "@prisma/client";
import { ensureCerfaReceiptForDonation } from "@/lib/cerfa";
import {
  formatDonationFrequency,
  formatMoney,
  getBaseUrl,
  getStripe,
} from "@/lib/donations";
import {
  donationAdminNotificationEmail,
  donationThankYouEmail,
  sendEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function markCheckoutPaid(session: Stripe.Checkout.Session) {
  const donationId = session.metadata?.donationId || session.client_reference_id;

  if (!donationId) return;

  const donation = await prisma.donation.update({
    where: { id: donationId },
    data: {
      status: "PAID",
      paidAt: new Date(),
      stripeCheckoutSessionId: session.id,
      stripeCustomerId:
        typeof session.customer === "string" ? session.customer : undefined,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : undefined,
      stripeSubscriptionId:
        typeof session.subscription === "string" ? session.subscription : undefined,
      receiptStatus:
        session.metadata?.receiptNeeded === "true"
          ? ReceiptStatus.REQUESTED
          : ReceiptStatus.NOT_REQUESTED,
    },
    include: { receipt: true },
  });

  await scheduleSubscriptionCancellation(donation.id);
  await handleDonationConfirmation(donation.id);
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

async function scheduleSubscriptionCancellation(donationId: string) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    select: {
      frequency: true,
      recurringMonths: true,
      stripeSubscriptionId: true,
    },
  });

  if (
    donation?.frequency !== "MONTHLY" ||
    !donation.recurringMonths ||
    donation.recurringMonths <= 0 ||
    !donation.stripeSubscriptionId
  ) {
    return;
  }

  await getStripe().subscriptions.update(donation.stripeSubscriptionId, {
    cancel_at: Math.floor(
      addMonths(new Date(), donation.recurringMonths).getTime() / 1000,
    ),
    metadata: {
      donationId,
      recurringMonths: String(donation.recurringMonths),
    },
  });
}

async function updatePaymentIntent(intent: Stripe.PaymentIntent) {
  const donation = await prisma.donation.findFirst({
    where: { stripePaymentIntentId: intent.id },
  });

  if (!donation) return;

  if (intent.status === "succeeded") {
    const updatedDonation = await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: "PAID",
        paidAt: donation.paidAt ?? new Date(),
      },
    });
    await handleDonationConfirmation(updatedDonation.id);
  }

  if (intent.status === "canceled") {
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
      },
    });
  }
}

async function updateChargeReceipt(charge: Stripe.Charge) {
  if (!charge.payment_intent || typeof charge.payment_intent !== "string") {
    return;
  }

  const donations = await prisma.donation.findMany({
    where: { stripePaymentIntentId: charge.payment_intent },
    select: { id: true, metadata: true },
  });

  await Promise.all(
    donations.map((donation) => {
      const metadata =
        donation.metadata &&
        typeof donation.metadata === "object" &&
        !Array.isArray(donation.metadata)
          ? (donation.metadata as Record<string, unknown>)
          : {};

      return prisma.donation.update({
        where: { id: donation.id },
        data: {
          metadata: {
            ...metadata,
            stripeReceiptUrl: charge.receipt_url,
            stripeReceiptNumber: charge.receipt_number,
          },
        },
      });
    }),
  );
}

async function ensureStripeReceiptMetadata(donationId: string) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    select: {
      id: true,
      metadata: true,
      stripePaymentIntentId: true,
    },
  });

  if (!donation?.stripePaymentIntentId) return;

  const metadata =
    donation.metadata &&
    typeof donation.metadata === "object" &&
    !Array.isArray(donation.metadata)
      ? (donation.metadata as Record<string, unknown>)
      : {};

  if (metadata.stripeReceiptUrl) return;

  const intent = await getStripe().paymentIntents.retrieve(
    donation.stripePaymentIntentId,
    { expand: ["latest_charge"] },
  );
  const charge =
    intent.latest_charge && typeof intent.latest_charge !== "string"
      ? intent.latest_charge
      : null;

  if (!charge?.receipt_url) return;

  await prisma.donation.update({
    where: { id: donation.id },
    data: {
      metadata: {
        ...metadata,
        stripeReceiptUrl: charge.receipt_url,
        stripeReceiptNumber: charge.receipt_number,
      },
    },
  });
}

async function handleDonationConfirmation(donationId: string) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { receipt: true },
  });

  if (!donation || donation.status !== "PAID") {
    return;
  }

  const metadata =
    donation.metadata &&
    typeof donation.metadata === "object" &&
    !Array.isArray(donation.metadata)
      ? (donation.metadata as Record<string, unknown>)
      : {};

  if (metadata.thankYouEmailSentAt && metadata.adminDonationEmailSentAt) {
    return;
  }

  const cerfa = donation.receiptNeeded
    ? await ensureCerfaReceiptForDonation(donation.id)
    : null;
  await ensureStripeReceiptMetadata(donation.id);
  const refreshedDonation = await prisma.donation.findUnique({
    where: { id: donation.id },
    include: { receipt: true },
  });

  if (!refreshedDonation) return;

  const refreshedMetadata =
    refreshedDonation.metadata &&
    typeof refreshedDonation.metadata === "object" &&
    !Array.isArray(refreshedDonation.metadata)
      ? (refreshedDonation.metadata as Record<string, unknown>)
      : {};
  const stripeReceiptUrl =
    typeof refreshedMetadata.stripeReceiptUrl === "string"
      ? refreshedMetadata.stripeReceiptUrl
      : null;
  const amount = formatMoney(
    refreshedDonation.amountCents,
    refreshedDonation.currency,
  );
  const frequency = formatDonationFrequency(
    refreshedDonation.frequency,
    refreshedDonation.recurringMonths,
  );
  const receiptNumber = cerfa?.receipt.number ?? refreshedDonation.receipt?.number;
  const nextMetadata = { ...refreshedMetadata };

  if (!refreshedMetadata.thankYouEmailSentAt) {
    const email = donationThankYouEmail({
      donorName: refreshedDonation.donorName,
      amount,
      frequency,
      receiptNumber,
      stripeReceiptUrl,
    });

    const sent = await sendEmail({
      to: refreshedDonation.donorEmail,
      subject: email.subject,
      html: email.html,
      attachments: cerfa
        ? [
            {
              filename: `${cerfa.receipt.number}.pdf`,
              content: cerfa.pdf.toString("base64"),
            },
          ]
        : undefined,
    });

    if (sent.ok) {
      nextMetadata.thankYouEmailSentAt = new Date().toISOString();
    }
  }

  if (!refreshedMetadata.adminDonationEmailSentAt) {
    if (nextMetadata.thankYouEmailSentAt) {
      await sleep(1200);
    }

    const adminSent = await sendAdminDonationEmail({
      amount,
      donation: refreshedDonation,
      frequency,
      receiptNumber,
      stripeReceiptUrl,
    });

    if (adminSent) {
      nextMetadata.adminDonationEmailSentAt = new Date().toISOString();
    }
  }

  if (
    nextMetadata.thankYouEmailSentAt !== refreshedMetadata.thankYouEmailSentAt ||
    nextMetadata.adminDonationEmailSentAt !== refreshedMetadata.adminDonationEmailSentAt
  ) {
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        receiptStatus:
          cerfa && nextMetadata.thankYouEmailSentAt
            ? ReceiptStatus.SENT
            : refreshedDonation.receiptStatus,
        metadata: nextMetadata as Prisma.InputJsonObject,
      },
    });
  }
}

async function adminDonationRecipients() {
  const configured =
    process.env.ADMIN_DONATION_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL;

  if (configured) {
    return Array.from(new Set(configured
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean)));
  }

  const admins = await prisma.user.findMany({
    where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
    select: { email: true },
  });

  return Array.from(new Set(admins.map((admin) => admin.email).filter(Boolean)));
}

async function sendAdminDonationEmail({
  amount,
  donation,
  frequency,
  receiptNumber,
  stripeReceiptUrl,
}: {
  amount: string;
  donation: {
    id: string;
    donorEmail: string;
    donorName: string | null;
    donorPhone: string | null;
    stripePaymentIntentId: string | null;
  };
  frequency: string;
  receiptNumber?: string | null;
  stripeReceiptUrl?: string | null;
}) {
  const recipients = await adminDonationRecipients();

  if (recipients.length === 0) {
    return false;
  }

  const email = donationAdminNotificationEmail({
    adminLink: `${getBaseUrl()}/admin/dons?q=${encodeURIComponent(donation.id)}`,
    amount,
    donorEmail: donation.donorEmail,
    donorName: donation.donorName,
    donorPhone: donation.donorPhone,
    frequency,
    receiptNumber,
    stripePaymentIntentId: donation.stripePaymentIntentId,
    stripeReceiptUrl,
  });

  const [primaryRecipient, ...bccRecipients] = recipients;

  const result = await sendEmail({
    to: primaryRecipient,
    bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
    subject: email.subject,
    html: email.html,
  });

  return result.ok;
}

async function updateChargeRefund(charge: Stripe.Charge) {
  if (!charge.payment_intent || typeof charge.payment_intent !== "string") {
    return;
  }

  const donation = await prisma.donation.findUnique({
    where: { stripePaymentIntentId: charge.payment_intent },
  });

  if (!donation) return;

  const refundedAmount = charge.amount_refunded ?? 0;
  const status =
    refundedAmount >= donation.amountCents ? "REFUNDED" : "PARTIALLY_REFUNDED";

  await prisma.donation.update({
    where: { id: donation.id },
    data: {
      status,
      refundedAmountCents: refundedAmount,
      refundedAt: refundedAmount > 0 ? new Date() : null,
    },
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json(
      { error: "Webhook Stripe non configure." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signature invalide." },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    await markCheckoutPaid(event.data.object);
  }

  if (
    event.type === "payment_intent.succeeded" ||
    event.type === "payment_intent.canceled"
  ) {
    await updatePaymentIntent(event.data.object);
  }

  if (event.type === "charge.refunded") {
    await updateChargeRefund(event.data.object);
  }

  if (event.type === "charge.succeeded" || event.type === "charge.updated") {
    await updateChargeReceipt(event.data.object);
  }

  return NextResponse.json({ received: true });
}
