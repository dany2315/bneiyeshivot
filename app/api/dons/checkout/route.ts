import { NextResponse } from "next/server";
import { DonationFrequency, PaymentProvider } from "@prisma/client";
import {
  getBaseUrl,
  getStripe,
  readDonationAmount,
  receiptStatusFromNeeded,
} from "@/lib/donations";
import { prisma } from "@/lib/prisma";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeCurrency(value: string) {
  const currency = value.toUpperCase();

  if (!["EUR", "USD", "ILS"].includes(currency)) {
    throw new Error("Devise invalide.");
  }

  return currency;
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
  const campaign = readString(formData, "campaign") || "general";
  const donorType = readString(formData, "donorType") || "PARTICULIER";
  const companyName = readString(formData, "companyName");
  const anonymous = readString(formData, "anonymous") === "true";
  const newsletter = readString(formData, "newsletter") !== "false";
  const receiptNeeded = formData.get("receiptNeeded") === "on";
  const frequency =
    formData.get("frequency") === "MONTHLY"
      ? DonationFrequency.MONTHLY
      : DonationFrequency.ONE_TIME;

  if (!firstName || !lastName || !email) {
    return NextResponse.json(
      { error: "Nom, prenom et email obligatoires." },
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
      amountCents,
      currency,
      donorEmail: email,
      donorFirstName: firstName,
      donorLastName: lastName,
      donorName: `${firstName} ${lastName}`.trim(),
      donorPhone: phone || null,
      dedication: dedication || null,
      receiptNeeded,
      receiptStatus: receiptStatusFromNeeded(receiptNeeded),
      metadata: {
        campaign,
        donorType,
        companyName: companyName || null,
        anonymous,
        newsletter,
        receipt: receiptNeeded
          ? {
              type: readString(formData, "receiptType") || "PARTICULIER",
              address: readString(formData, "receiptAddress"),
              zip: readString(formData, "receiptZip"),
              city: readString(formData, "receiptCity"),
              country: readString(formData, "receiptCountry") || "France",
              taxId: readString(formData, "receiptTaxId"),
            }
          : null,
      },
    },
  });

  const stripe = getStripe();
  const baseUrl = getBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: frequency === DonationFrequency.MONTHLY ? "subscription" : "payment",
    customer_email: email,
    client_reference_id: donation.id,
    success_url: `${baseUrl}/dons/merci?donation=${donation.id}`,
    cancel_url: `${baseUrl}/dons?annule=1`,
    metadata: {
      donationId: donation.id,
      receiptNeeded: String(receiptNeeded),
      campaign,
      donorType,
      anonymous: String(anonymous),
    },
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

  await prisma.donation.update({
    where: { id: donation.id },
    data: {
      stripeCheckoutSessionId: session.id,
      stripeCustomerId:
        typeof session.customer === "string" ? session.customer : null,
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Session Stripe creee sans URL de paiement." },
      { status: 500 },
    );
  }

  return NextResponse.redirect(session.url, 303);
}
