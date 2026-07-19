import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  DonationFrequency,
  PaymentProvider,
  Prisma,
  ReceiptStatus,
} from "@prisma/client";
import { ensureCerfaReceiptForDonation } from "@/lib/cerfa";
import {
  formatDonationFrequency,
  formatMoney,
  getBaseUrl,
  getStripe,
} from "@/lib/donations";
import {
  donationAdminNotificationEmail,
  donationRecurringPaymentEmail,
  donationThankYouEmail,
  sendEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function metadataObject(metadata: unknown) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {};
}

function stripeTimestamp(seconds?: number | null) {
  return seconds ? new Date(seconds * 1000) : null;
}

function paymentLabel(installmentNumber?: number | null, installmentTotal?: number | null) {
  if (!installmentNumber) return null;

  return installmentTotal && installmentTotal > 0
    ? `${installmentNumber} / ${installmentTotal}`
    : `${installmentNumber} / sans limite`;
}

function receiptAddressFromSession(session: Stripe.Checkout.Session) {
  const address = session.customer_details?.address;

  if (!address) return null;

  return {
    address: [address.line1, address.line2].filter(Boolean).join(" "),
    zip: address.postal_code ?? "",
    city: address.city ?? "",
    country: address.country ?? "FR",
  };
}

function readSessionMetadata(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {};
  const firstName = String(metadata.firstName ?? "").trim();
  const lastName = String(metadata.lastName ?? "").trim();
  const fallbackEmail = session.customer_details?.email ?? session.customer_email ?? "";
  const email = String(metadata.email ?? fallbackEmail).trim().toLowerCase();
  const frequency =
    metadata.frequency === DonationFrequency.MONTHLY
      ? DonationFrequency.MONTHLY
      : DonationFrequency.ONE_TIME;
  const amountCents = Number(metadata.amountCents ?? session.amount_total ?? 0);
  const recurringMonths = Number(metadata.recurringMonths);
  const donorType = metadata.donorType === "ENTREPRISE" ? "ENTREPRISE" : "PARTICULIER";

  return {
    amountCents: Number.isFinite(amountCents) ? amountCents : 0,
    companyLegalForm: String(metadata.companyLegalForm ?? "").trim(),
    companyName: String(metadata.companyName ?? "").trim(),
    currency: String(metadata.currency ?? session.currency ?? "EUR").toUpperCase(),
    dedication: String(metadata.dedication ?? "").trim(),
    donorType,
    email,
    firstName,
    lastName,
    phone: String(metadata.phone ?? "").trim(),
    receiptNeeded: metadata.receiptNeeded !== "false",
    receiptTaxId: String(metadata.receiptTaxId ?? "").trim(),
    recurringMonths:
      frequency === DonationFrequency.MONTHLY &&
      Number.isInteger(recurringMonths) &&
      recurringMonths >= 0
        ? recurringMonths
        : null,
    frequency,
  };
}

async function paymentIntentIdFromSession(session: Stripe.Checkout.Session) {
  if (typeof session.payment_intent === "string") {
    return session.payment_intent;
  }

  if (typeof session.subscription !== "string") {
    return null;
  }

  const subscription = await getStripe().subscriptions.retrieve(session.subscription, {
    expand: ["latest_invoice.payment_intent"],
  });
  const latestInvoice =
    subscription.latest_invoice && typeof subscription.latest_invoice !== "string"
      ? subscription.latest_invoice
      : null;
  const paymentIntent = (latestInvoice as { payment_intent?: string | Stripe.PaymentIntent } | null)
    ?.payment_intent;

  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id ?? null;
}

async function markCheckoutPaid(session: Stripe.Checkout.Session) {
  const donationId = session.metadata?.donationId || session.client_reference_id;
  const existingBySession = await prisma.donation.findUnique({
    where: { stripeCheckoutSessionId: session.id },
    select: { id: true, metadata: true },
  });
  const paymentIntentId = await paymentIntentIdFromSession(session);

  if (!donationId && existingBySession) {
    await prisma.donation.update({
      where: { id: existingBySession.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        stripeCustomerId:
          typeof session.customer === "string" ? session.customer : undefined,
        stripePaymentIntentId: paymentIntentId ?? undefined,
        stripeSubscriptionId:
          typeof session.subscription === "string" ? session.subscription : undefined,
      },
    });
    await scheduleSubscriptionCancellation(existingBySession.id);
    await handleDonationConfirmation(existingBySession.id);
    return;
  }

  if (!donationId) {
    const input = readSessionMetadata(session);
    const user = input.email
      ? await prisma.user.findUnique({
          where: { email: input.email },
          select: { id: true },
        })
      : null;
    const stripeAddress = receiptAddressFromSession(session);
    const donation = await prisma.donation.create({
      data: {
        userId: user?.id,
        provider: PaymentProvider.STRIPE,
        status: "PAID",
        paidAt: new Date(),
        frequency: input.frequency,
        recurringMonths: input.recurringMonths,
        amountCents: input.amountCents,
        currency: input.currency,
        donorEmail: input.email,
        donorFirstName: input.firstName || null,
        donorLastName: input.lastName || null,
        donorName:
          [input.firstName, input.lastName].filter(Boolean).join(" ") || input.email,
        donorPhone: input.phone || null,
        dedication: input.dedication || null,
        receiptNeeded: input.receiptNeeded,
        receiptStatus: input.receiptNeeded
          ? ReceiptStatus.REQUESTED
          : ReceiptStatus.NOT_REQUESTED,
        stripeCheckoutSessionId: session.id,
        stripeCustomerId:
          typeof session.customer === "string" ? session.customer : null,
        stripePaymentIntentId: paymentIntentId,
        stripeSubscriptionId:
          typeof session.subscription === "string" ? session.subscription : null,
        metadata: {
          donorType: input.donorType,
          companyName: input.companyName || null,
          companyLegalForm: input.companyLegalForm || null,
          receipt: {
            type: input.donorType,
            address: stripeAddress?.address ?? "",
            zip: stripeAddress?.zip ?? "",
            city: stripeAddress?.city ?? "",
            country: stripeAddress?.country ?? "France",
            taxId: input.donorType === "ENTREPRISE" ? input.receiptTaxId : "",
          },
        },
      },
      include: { receipt: true },
    });

    await scheduleSubscriptionCancellation(donation.id);
    await handleDonationConfirmation(donation.id);
    return;
  }

  const existingDonation = await prisma.donation.findUnique({
    where: { id: donationId },
    select: { metadata: true },
  });
  const metadata = metadataObject(existingDonation?.metadata);
  const receipt = metadataObject(metadata.receipt);
  const stripeAddress = receiptAddressFromSession(session);

  const donation = await prisma.donation.update({
    where: { id: donationId },
    data: {
      status: "PAID",
      paidAt: new Date(),
      stripeCheckoutSessionId: session.id,
      stripeCustomerId:
        typeof session.customer === "string" ? session.customer : undefined,
      stripePaymentIntentId:
        paymentIntentId ?? undefined,
      stripeSubscriptionId:
        typeof session.subscription === "string" ? session.subscription : undefined,
      receiptStatus:
        session.metadata?.receiptNeeded === "true"
          ? ReceiptStatus.REQUESTED
          : ReceiptStatus.NOT_REQUESTED,
      metadata: {
        ...metadata,
        receipt: {
          ...receipt,
          ...(stripeAddress ?? {}),
        },
      },
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

async function upsertDonationPaymentFromIntent(
  donationId: string,
  intent: Stripe.PaymentIntent,
  status: "PAID" | "FAILED" | "CANCELED" | "PENDING",
) {
  const failureReason =
    intent.last_payment_error?.message ||
    intent.cancellation_reason ||
    null;

  return prisma.donationPayment.upsert({
    where: { stripePaymentIntentId: intent.id },
    create: {
      donationId,
      amountCents: intent.amount,
      currency: intent.currency.toUpperCase(),
      installmentNumber: 1,
      installmentTotal: 1,
      billingReason: "payment_intent",
      status,
      stripePaymentIntentId: intent.id,
      failureReason,
      paidAt: status === "PAID" ? new Date() : null,
      failedAt: status === "FAILED" ? new Date() : null,
    },
    update: {
      status,
      failureReason,
      paidAt: status === "PAID" ? new Date() : undefined,
      failedAt: status === "FAILED" ? new Date() : undefined,
    },
  });
}

async function updatePaymentIntent(intent: Stripe.PaymentIntent) {
  const metadataDonationId = intent.metadata?.donationId;
  const donation = await prisma.donation.findFirst({
    where: metadataDonationId
      ? { id: metadataDonationId }
      : { stripePaymentIntentId: intent.id },
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
    if (donation.frequency !== DonationFrequency.MONTHLY) {
      await upsertDonationPaymentFromIntent(donation.id, intent, "PAID");
    }
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
    if (donation.frequency !== DonationFrequency.MONTHLY) {
      await upsertDonationPaymentFromIntent(donation.id, intent, "CANCELED");
    }
  }

  if (intent.status === "requires_payment_method") {
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: "FAILED",
        failureReason: intent.last_payment_error?.message ?? null,
      },
    });
    if (donation.frequency !== DonationFrequency.MONTHLY) {
      await upsertDonationPaymentFromIntent(donation.id, intent, "FAILED");
      await notifyFailedDonation(donation.id);
    }
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
    donations.map(async (donation) => {
      const metadata =
        donation.metadata &&
        typeof donation.metadata === "object" &&
        !Array.isArray(donation.metadata)
          ? (donation.metadata as Record<string, unknown>)
          : {};

      await prisma.$transaction([
        prisma.donation.update({
          where: { id: donation.id },
          data: {
            metadata: {
              ...metadata,
              stripeReceiptUrl: charge.receipt_url,
              stripeReceiptNumber: charge.receipt_number,
            },
          },
        }),
        prisma.donationPayment.updateMany({
          where: { stripePaymentIntentId: charge.payment_intent as string },
          data: {
            stripeChargeId: charge.id,
            stripeReceiptUrl: charge.receipt_url,
            stripeReceiptNumber: charge.receipt_number,
          },
        }),
      ]);
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
    const email = await donationThankYouEmail({
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
      await prisma.auditLog.create({
        data: {
          action: "donation.thank_you_email_sent",
          entity: "Donation",
          entityId: refreshedDonation.id,
          metadata: {
            to: refreshedDonation.donorEmail,
            receiptNumber,
            stripeReceiptUrl,
          },
        },
      });
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
      await prisma.auditLog.create({
        data: {
          action: "donation.admin_notification_email_sent",
          entity: "Donation",
          entityId: refreshedDonation.id,
          metadata: {
            receiptNumber,
            stripeReceiptUrl,
          },
        },
      });
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
  return ["contact@bneiyeshivot.com"];
}

async function sendAdminDonationEmail({
  amount,
  donation,
  failureReason,
  frequency,
  heading,
  paymentLabel,
  paymentStatusLabel,
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
  failureReason?: string | null;
  frequency: string;
  heading?: string;
  paymentLabel?: string | null;
  paymentStatusLabel?: string | null;
  receiptNumber?: string | null;
  stripeReceiptUrl?: string | null;
}) {
  const recipients = await adminDonationRecipients();

  if (recipients.length === 0) {
    return false;
  }

  const email = await donationAdminNotificationEmail({
    adminLink: `${getBaseUrl()}/admin/dons?q=${encodeURIComponent(donation.id)}`,
    amount,
    donorEmail: donation.donorEmail,
    donorName: donation.donorName,
    donorPhone: donation.donorPhone,
    failureReason,
    frequency,
    heading,
    paymentLabel,
    paymentStatusLabel,
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

async function notifyFailedDonation(donationId: string) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { receipt: true },
  });

  if (!donation || donation.status !== "FAILED") {
    return;
  }

  const metadata = metadataObject(donation.metadata);

  if (metadata.adminFailureEmailSentAt) {
    return;
  }

  const amount = formatMoney(donation.amountCents, donation.currency);
  const frequency = formatDonationFrequency(
    donation.frequency,
    donation.recurringMonths,
  );
  const sent = await sendAdminDonationEmail({
    amount,
    donation: {
      id: donation.id,
      donorEmail: donation.donorEmail,
      donorName: donation.donorName,
      donorPhone: donation.donorPhone,
      stripePaymentIntentId: donation.stripePaymentIntentId,
    },
    failureReason: donation.failureReason,
    frequency,
    heading: "Don en echec",
    paymentStatusLabel: "Echec",
    receiptNumber: donation.receipt?.number,
  });

  if (!sent) {
    return;
  }

  await prisma.donation.update({
    where: { id: donation.id },
    data: {
      metadata: {
        ...metadata,
        adminFailureEmailSentAt: new Date().toISOString(),
      } as Prisma.InputJsonObject,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "donation.admin_failure_email_sent",
      entity: "Donation",
      entityId: donation.id,
      metadata: {
        failureReason: donation.failureReason,
        stripePaymentIntentId: donation.stripePaymentIntentId,
      },
    },
  });
}

function invoicePaymentIntentId(invoice: Stripe.Invoice) {
  const invoiceWithPaymentIntent = invoice as Stripe.Invoice & {
    payment_intent?: string | Stripe.PaymentIntent | null;
  };
  const paymentIntent = invoiceWithPaymentIntent.payment_intent;

  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id ?? null;
}

function invoiceChargeId(invoice: Stripe.Invoice) {
  const invoiceWithCharge = invoice as Stripe.Invoice & {
    charge?: string | Stripe.Charge | null;
  };
  const charge = invoiceWithCharge.charge;

  return typeof charge === "string" ? charge : charge?.id ?? null;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice) {
  const invoiceWithSubscription = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };
  const subscription = invoiceWithSubscription.subscription;

  return typeof subscription === "string" ? subscription : subscription?.id ?? null;
}

function invoiceBillingReason(invoice: Stripe.Invoice) {
  const invoiceWithReason = invoice as Stripe.Invoice & {
    billing_reason?: string | null;
  };

  return invoiceWithReason.billing_reason ?? null;
}

function invoicePeriod(invoice: Stripe.Invoice) {
  const firstLine = invoice.lines.data[0];

  return {
    periodStart: stripeTimestamp(firstLine?.period?.start),
    periodEnd: stripeTimestamp(firstLine?.period?.end),
  };
}

async function nextInstallmentNumber(donationId: string, invoiceId: string) {
  const existing = await prisma.donationPayment.findUnique({
    where: { stripeInvoiceId: invoiceId },
    select: { installmentNumber: true },
  });

  if (existing?.installmentNumber) {
    return existing.installmentNumber;
  }

  const count = await prisma.donationPayment.count({
    where: { donationId, stripeInvoiceId: { not: invoiceId } },
  });

  return count + 1;
}

async function notifyRecurringPayment(paymentId: string, statusLabel: string) {
  const payment = await prisma.donationPayment.findUnique({
    where: { id: paymentId },
    include: { donation: true },
  });

  if (!payment || payment.billingReason === "subscription_create") {
    return;
  }

  const metadata = metadataObject(payment.metadata);
  const adminKey = `admin${statusLabel}EmailSentAt`;
  const donorKey = `donor${statusLabel}EmailSentAt`;

  if (metadata[adminKey] && metadata[donorKey]) {
    return;
  }

  const amount = formatMoney(payment.amountCents, payment.currency);
  const frequency = formatDonationFrequency(
    payment.donation.frequency,
    payment.donation.recurringMonths,
  );
  const installmentLabel =
    paymentLabel(payment.installmentNumber, payment.installmentTotal) ??
    "mensuel";
  const nextMetadata = { ...metadata };

  if (!metadata[donorKey]) {
    const donorEmail = await donationRecurringPaymentEmail({
      amount,
      donorName: payment.donation.donorName,
      failureReason: payment.failureReason,
      frequency,
      paymentLabel: installmentLabel,
      statusLabel,
      stripeReceiptUrl: payment.stripeReceiptUrl,
    });
    const sent = await sendEmail({
      to: payment.donation.donorEmail,
      subject: donorEmail.subject,
      html: donorEmail.html,
    });

    if (sent.ok) {
      nextMetadata[donorKey] = new Date().toISOString();
    }
  }

  if (!metadata[adminKey]) {
    const adminSent = await sendAdminDonationEmail({
      amount,
      donation: {
        id: payment.donation.id,
        donorEmail: payment.donation.donorEmail,
        donorName: payment.donation.donorName,
        donorPhone: payment.donation.donorPhone,
        stripePaymentIntentId: payment.stripePaymentIntentId,
      },
      failureReason: payment.failureReason,
      frequency,
      heading: `Paiement recurrent ${statusLabel.toLowerCase()}`,
      paymentLabel: installmentLabel,
      paymentStatusLabel: statusLabel,
      stripeReceiptUrl: payment.stripeReceiptUrl,
    });

    if (adminSent) {
      nextMetadata[adminKey] = new Date().toISOString();
    }
  }

  await prisma.donationPayment.update({
    where: { id: payment.id },
    data: { metadata: nextMetadata as Prisma.InputJsonObject },
  });
}

async function updateInvoicePayment(
  invoice: Stripe.Invoice,
  status: "PAID" | "FAILED",
) {
  const subscriptionId = invoiceSubscriptionId(invoice);
  const metadataDonationId = invoice.metadata?.donationId;
  const donation = await prisma.donation.findFirst({
    where: metadataDonationId
      ? { id: metadataDonationId }
      : subscriptionId
        ? { stripeSubscriptionId: subscriptionId }
        : { stripePaymentIntentId: invoicePaymentIntentId(invoice) ?? "" },
  });

  if (!donation) return;

  const invoiceId = invoice.id;
  const installmentNumber = await nextInstallmentNumber(donation.id, invoiceId);
  const installmentTotal =
    donation.recurringMonths && donation.recurringMonths > 0
      ? donation.recurringMonths
      : null;
  const period = invoicePeriod(invoice);
  const paymentIntentId = invoicePaymentIntentId(invoice);
  const chargeId = invoiceChargeId(invoice);
  const failureReason =
    invoice.last_finalization_error?.message ?? "Paiement non confirme par Stripe";
  const billingReason = invoiceBillingReason(invoice);
  const payment = await prisma.donationPayment.upsert({
    where: { stripeInvoiceId: invoiceId },
    create: {
      donationId: donation.id,
      amountCents: invoice.amount_paid || invoice.amount_due || donation.amountCents,
      currency: (invoice.currency || donation.currency).toUpperCase(),
      installmentNumber,
      installmentTotal,
      billingReason,
      status,
      stripeInvoiceId: invoiceId,
      stripePaymentIntentId: paymentIntentId,
      stripeChargeId: chargeId,
      stripeReceiptUrl: invoice.hosted_invoice_url,
      failureReason: status === "FAILED" ? failureReason : null,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      paidAt: status === "PAID" ? new Date() : null,
      failedAt: status === "FAILED" ? new Date() : null,
    },
    update: {
      amountCents: invoice.amount_paid || invoice.amount_due || donation.amountCents,
      currency: (invoice.currency || donation.currency).toUpperCase(),
      installmentNumber,
      installmentTotal,
      billingReason,
      status,
      stripePaymentIntentId: paymentIntentId,
      stripeChargeId: chargeId,
      stripeReceiptUrl: invoice.hosted_invoice_url,
      failureReason: status === "FAILED" ? failureReason : null,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      paidAt: status === "PAID" ? new Date() : undefined,
      failedAt: status === "FAILED" ? new Date() : undefined,
    },
  });

  await prisma.donation.update({
    where: { id: donation.id },
    data: {
      status,
      paidAt: status === "PAID" ? donation.paidAt ?? new Date() : donation.paidAt,
      failureReason: status === "FAILED" ? failureReason : null,
    },
  });

  if (status === "PAID" && billingReason === "subscription_create") {
    await handleDonationConfirmation(donation.id);
    return;
  }

  await notifyRecurringPayment(
    payment.id,
    status === "PAID" ? "Reussi" : "Echec",
  );
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
  await prisma.donationPayment.updateMany({
    where: { stripePaymentIntentId: charge.payment_intent },
    data: {
      refundedAmountCents: refundedAmount,
      refundedAt: refundedAmount > 0 ? new Date() : null,
      status,
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
    event.type === "payment_intent.canceled" ||
    event.type === "payment_intent.payment_failed"
  ) {
    await updatePaymentIntent(event.data.object);
  }

  if (event.type === "invoice.payment_succeeded") {
    await updateInvoicePayment(event.data.object, "PAID");
  }

  if (event.type === "invoice.payment_failed") {
    await updateInvoicePayment(event.data.object, "FAILED");
  }

  if (event.type === "charge.refunded") {
    await updateChargeRefund(event.data.object);
  }

  if (event.type === "charge.succeeded" || event.type === "charge.updated") {
    await updateChargeReceipt(event.data.object);
  }

  return NextResponse.json({ received: true });
}
