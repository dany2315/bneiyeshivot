import { NextResponse } from "next/server";
import { DonationFrequency } from "@prisma/client";
import {
  getRequestBaseUrl,
  getStripe,
  readDonationAmount,
} from "@/lib/donations";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeCurrency(value: string) {
  const currency = value.toUpperCase();

  if (currency !== "EUR") {
    throw new Error("Seule la devise EUR est activée pour les dons en ligne.");
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

export async function POST(request: Request) {
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
      { error: "Nom, prénom, email et téléphone obligatoires." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const baseUrl = getRequestBaseUrl(request);
  const checkoutMetadata = {
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
    receiptTaxId:
      normalizedDonorType === "ENTREPRISE"
        ? stripeMetadataValue(readString(formData, "receiptTaxId"))
        : "",
  };
  const session = await stripe.checkout.sessions.create({
    mode: frequency === DonationFrequency.MONTHLY ? "subscription" : "payment",
    payment_method_types: ["card"],
    billing_address_collection: "required",
    customer_email: email,
    success_url: `${baseUrl}/dons/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dons?annule=1`,
    metadata: checkoutMetadata,
    subscription_data:
      frequency === DonationFrequency.MONTHLY
        ? {
            metadata: checkoutMetadata,
          }
        : undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: amountCents,
          product_data: {
            name:
              frequency === DonationFrequency.MONTHLY
                ? "Don mensuel Bnei Yeshivot"
                : "Don Bnei Yeshivot",
          },
          recurring:
            frequency === DonationFrequency.MONTHLY
              ? { interval: "month" }
              : undefined,
        },
      },
    ],
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Session de paiement créée sans URL de paiement." },
      { status: 500 },
    );
  }

  return NextResponse.redirect(session.url, 303);
}
