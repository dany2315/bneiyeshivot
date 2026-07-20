import { NextResponse } from "next/server";
import {
  buildNedarimPaymentFields,
  createPendingNedarimDonation,
  isNedarimPlusConfigured,
  readNedarimAmountCents,
  readNedarimFrequency,
  readNedarimRecurringMonths,
} from "@/lib/nedarim-plus";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function POST(request: Request) {
  if (!isNedarimPlusConfigured()) {
    return NextResponse.json(
      { error: "Nedarim Plus n’est pas configuré." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const currency = readString(formData, "currency").toUpperCase();

  if (currency !== "ILS") {
    return NextResponse.json(
      { error: "Nedarim Plus est réservé aux dons en shekel." },
      { status: 400 },
    );
  }

  const amountCents = readNedarimAmountCents(formData);
  const firstName = readString(formData, "firstName");
  const lastName = readString(formData, "lastName");
  const email = readString(formData, "email").toLowerCase();
  const phone = readString(formData, "phone");
  const nedarimZeout = readString(formData, "nedarimZeout");
  const nedarimStreet = readString(formData, "nedarimStreet");
  const nedarimCity = readString(formData, "nedarimCity");
  const dedication = readString(formData, "dedication");
  const donorType =
    readString(formData, "donorType") === "ENTREPRISE"
      ? "ENTREPRISE"
      : "PARTICULIER";
  const companyName = readString(formData, "companyName");
  const companyLegalForm = readString(formData, "companyLegalForm");
  const frequency = readNedarimFrequency(formData);
  const recurringMonths = readNedarimRecurringMonths(formData, frequency);

  if (!firstName || !lastName || !email || !phone) {
    return NextResponse.json(
      { error: "Nom, prénom, email et téléphone obligatoires." },
      { status: 400 },
    );
  }

  if (!nedarimStreet || !nedarimCity) {
    return NextResponse.json(
      { error: "Rue et ville sont obligatoires pour un paiement en shekel." },
      { status: 400 },
    );
  }

  if (donorType === "ENTREPRISE" && !companyName) {
    return NextResponse.json(
      { error: "Le nom de l’entreprise est obligatoire." },
      { status: 400 },
    );
  }

  const donation = await createPendingNedarimDonation({
    amountCents,
    companyLegalForm,
    companyName,
    dedication,
    donorType,
    email,
    firstName,
    frequency,
    lastName,
    nedarimCity,
    nedarimStreet,
    nedarimZeout,
    phone,
    recurringMonths,
  });

  return NextResponse.json({
    donationId: donation.id,
    fields: buildNedarimPaymentFields({
      amountCents,
      dedication,
      donationId: donation.id,
      email,
      firstName,
      frequency,
      lastName,
      nedarimCity,
      nedarimStreet,
      nedarimZeout,
      phone,
      recurringMonths,
    }),
  });
}
