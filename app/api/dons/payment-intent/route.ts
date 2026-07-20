import { NextResponse } from "next/server";
import {
  DonationFrequency,
  PaymentProvider,
  Prisma,
  ReceiptStatus,
} from "@prisma/client";
import Stripe from "stripe";
import {
  getStripe,
  readDonationAmount,
} from "@/lib/donations";
import { prisma } from "@/lib/prisma";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeCurrency(value: string) {
  const currency = value.toUpperCase();

  if (currency !== "EUR" && currency !== "ILS") {
    throw new Error("Seules les devises EUR et ILS sont activees pour les dons en ligne.");
  }

  return currency;
}

function readRecurringMonths(formData: FormData, frequency: DonationFrequency) {
  if (frequency !== DonationFrequency.MONTHLY) {
    return null;
  }

  const months = Number(readString(formData, "recurringMonths"));

  if (!Number.isInteger(months) || months < 0 || months > 120) {
    return 12;
  }

  return months;
}

function stripeMetadataValue(value: string, maxLength = 450) {
  return value.slice(0, maxLength);
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function stripeInvoicePaymentConfirmation(invoice: Stripe.Invoice | null) {
  const invoiceWithPaymentIntent = invoice as
    | (Stripe.Invoice & {
        confirmation_secret?: { client_secret?: string | null } | null;
        payment_intent?: string | Stripe.PaymentIntent | null;
      })
    | null;
  const paymentIntent = invoiceWithPaymentIntent?.payment_intent;
  const normalizedPaymentIntent =
    typeof paymentIntent === "string" ? null : paymentIntent ?? null;
  const clientSecret =
    normalizedPaymentIntent?.client_secret ??
    invoiceWithPaymentIntent?.confirmation_secret?.client_secret ??
    null;
  const paymentIntentId =
    normalizedPaymentIntent?.id ??
    (clientSecret?.startsWith("pi_")
      ? clientSecret.split("_secret_")[0]
      : null);

  return {
    clientSecret,
    paymentIntent: normalizedPaymentIntent,
    paymentIntentId,
  };
}

function subscriptionLatestInvoice(subscription: Stripe.Subscription) {
  return subscription.latest_invoice && typeof subscription.latest_invoice !== "string"
    ? subscription.latest_invoice
    : null;
}

function subscriptionLatestInvoiceId(subscription: Stripe.Subscription) {
  if (!subscription.latest_invoice) return null;

  return typeof subscription.latest_invoice === "string"
    ? subscription.latest_invoice
    : subscription.latest_invoice.id;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const customAmount = readString(formData, "customAmount");
    const amountCents = readDonationAmount(customAmount || formData.get("amount"));
    const currency = normalizeCurrency(readString(formData, "currency") || "EUR");
    const firstName = readString(formData, "firstName");
    const lastName = readString(formData, "lastName");
    const email = readString(formData, "email").toLowerCase();
    const phone = readString(formData, "phone");
    const dedication = readString(formData, "dedication");
    const donorType = readString(formData, "donorType") || "PARTICULIER";
    const companyName = readString(formData, "companyName");
    const companyLegalForm = readString(formData, "companyLegalForm");
    const normalizedDonorType =
      donorType === "ENTREPRISE" ? "ENTREPRISE" : "PARTICULIER";
    const receiptNeeded = true;
    const frequency =
      formData.get("frequency") === "MONTHLY"
        ? DonationFrequency.MONTHLY
        : DonationFrequency.ONE_TIME;
    const recurringMonths = readRecurringMonths(formData, frequency);

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "Nom, prenom, email et telephone obligatoires." },
        { status: 400 },
      );
    }

    if (normalizedDonorType === "ENTREPRISE" && !companyName) {
      return NextResponse.json(
        { error: "Le nom de l'entreprise est obligatoire." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    const donation = await prisma.donation.create({
      data: {
        userId: user?.id,
        provider: PaymentProvider.STRIPE,
        status: "PENDING",
        frequency,
        recurringMonths,
        amountCents,
        currency,
        donorEmail: email,
        donorFirstName: firstName || null,
        donorLastName: lastName || null,
        donorName: [firstName, lastName].filter(Boolean).join(" ") || email,
        donorPhone: phone || null,
        dedication: dedication || null,
        receiptNeeded,
        receiptStatus: receiptNeeded
          ? ReceiptStatus.REQUESTED
          : ReceiptStatus.NOT_REQUESTED,
        metadata: {
          donorType: normalizedDonorType,
          companyName: companyName || null,
          companyLegalForm: companyLegalForm || null,
          receipt: {
            type: normalizedDonorType,
            address: "",
            zip: "",
            city: "",
            country: "France",
            taxId:
              normalizedDonorType === "ENTREPRISE"
                ? readString(formData, "receiptTaxId")
                : "",
          },
        },
      },
    });

    const stripe = getStripe();
    const metadata: Stripe.MetadataParam = {
      donationId: donation.id,
      amountCents: String(amountCents),
      currency,
      frequency,
      recurringMonths: recurringMonths == null ? "" : String(recurringMonths),
      receiptNeeded: String(receiptNeeded),
      donorType: normalizedDonorType,
      firstName: stripeMetadataValue(firstName),
      lastName: stripeMetadataValue(lastName),
      email: stripeMetadataValue(email),
      phone: stripeMetadataValue(phone),
      dedication: stripeMetadataValue(dedication),
      companyName: stripeMetadataValue(companyName),
      companyLegalForm: stripeMetadataValue(companyLegalForm),
    };

    if (frequency === DonationFrequency.MONTHLY) {
      const customer = await stripe.customers.create({
        email,
        name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
        phone: phone || undefined,
        metadata: { donationId: donation.id },
      });
      const product = await stripe.products.create({
        name: "Don mensuel Bnei Yeshivot",
        metadata: { donationId: donation.id },
      });
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product: product.id,
              recurring: { interval: "month" },
              unit_amount: amountCents,
            },
          },
        ],
        cancel_at:
          recurringMonths && recurringMonths > 0
            ? Math.floor(addMonths(new Date(), recurringMonths).getTime() / 1000)
            : undefined,
        metadata,
        payment_behavior: "default_incomplete",
        payment_settings: {
          payment_method_types: ["card", "link"],
          save_default_payment_method: "on_subscription",
        },
        expand: [
          "latest_invoice.confirmation_secret",
          "latest_invoice.payment_intent",
        ],
      });
      let { clientSecret, paymentIntent, paymentIntentId } =
        stripeInvoicePaymentConfirmation(subscriptionLatestInvoice(subscription));
      const latestInvoiceId = subscriptionLatestInvoiceId(subscription);

      if (!clientSecret || !paymentIntentId) {
        if (latestInvoiceId) {
          const invoice = await stripe.invoices.retrieve(latestInvoiceId, {
            expand: ["confirmation_secret", "payment_intent"],
          });
          const refreshedConfirmation = stripeInvoicePaymentConfirmation(invoice);

          clientSecret = refreshedConfirmation.clientSecret;
          paymentIntent = refreshedConfirmation.paymentIntent;
          paymentIntentId = refreshedConfirmation.paymentIntentId;
        }
      }

      if (!clientSecret || !paymentIntentId) {
        throw new Error("Stripe n'a pas retourne de client secret pour l'abonnement.");
      }

      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          stripeCustomerId: customer.id,
          stripePaymentIntentId: paymentIntentId,
          stripeSubscriptionId: subscription.id,
        },
      });
      await prisma.donationPayment.create({
        data: {
          donationId: donation.id,
          amountCents,
          currency,
          installmentNumber: 1,
          installmentTotal:
            recurringMonths && recurringMonths > 0 ? recurringMonths : null,
          billingReason: "subscription_create",
          status: paymentIntent?.status === "succeeded" ? "PAID" : "PENDING",
          stripeInvoiceId: latestInvoiceId,
          stripePaymentIntentId: paymentIntentId,
          metadata: { subscriptionId: subscription.id } as Prisma.InputJsonObject,
        },
      });

      return NextResponse.json({
        clientSecret,
        donationId: donation.id,
        mode: "subscription",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
      receipt_email: email,
      metadata,
      payment_method_types: ["card", "link"],
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe n'a pas retourne de client secret pour le paiement.");
    }

    await prisma.donation.update({
      where: { id: donation.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });
    await prisma.donationPayment.create({
      data: {
        donationId: donation.id,
        amountCents,
        currency,
        installmentNumber: 1,
        installmentTotal: 1,
        billingReason: "one_time",
        status: "PENDING",
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      donationId: donation.id,
      mode: "payment",
    });
  } catch (error) {
    console.error("[donations] payment-intent preparation failed", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de preparer le paiement Stripe.",
      },
      { status: 500 },
    );
  }
}
