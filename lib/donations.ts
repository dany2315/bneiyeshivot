import {
  CerfaReceiptType,
  DonationFrequency,
  DonationSource,
  PaymentProvider,
  PaymentStatus,
  ReceiptStatus,
} from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const donationAmountOptions = [20, 50, 100, 180, 260, 500];

export const donationCurrencyOptions = [
  { value: "EUR", label: "EUR", provider: PaymentProvider.STRIPE },
  { value: "USD", label: "USD", provider: PaymentProvider.STRIPE },
  { value: "ILS", label: "ILS", provider: PaymentProvider.STRIPE },
] as const;

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  PAID: "Reussi",
  FAILED: "Echec",
  REFUNDED: "Rembourse",
  PARTIALLY_REFUNDED: "Remboursement partiel",
  CANCELED: "Annule",
};

export const donationFrequencyLabels: Record<DonationFrequency, string> = {
  ONE_TIME: "Ponctuel",
  MONTHLY: "Recurrent mensuel",
};

export const donationSourceLabels: Record<DonationSource, string> = {
  ONLINE: "En ligne",
  ADMIN_CASH: "Especes",
  ADMIN_CHECK: "Cheque",
  ADMIN_BANK_TRANSFER: "Virement",
  ADMIN_OTHER: "Autre",
};

export const receiptTypeLabels: Record<CerfaReceiptType, string> = {
  PARTICULIER: "Cerfa particulier",
  ENTREPRISE: "Cerfa entreprise",
  ISF_IFI: "Cerfa IFI",
  AUTRE: "Autre recu",
};

export function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

export function readDonationAmount(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").replace(",", ".").trim();
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Montant invalide.");
  }

  return Math.round(amount * 100);
}

export function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY est manquant.");
  }

  return new Stripe(key);
}

export async function nextReceiptNumber(fiscalYear = new Date().getFullYear()) {
  const count = await prisma.receipt.count({
    where: { fiscalYear },
  });

  return `CERFA-${fiscalYear}-${String(count + 1).padStart(5, "0")}`;
}

export function receiptStatusFromNeeded(receiptNeeded: boolean) {
  return receiptNeeded ? ReceiptStatus.REQUESTED : ReceiptStatus.NOT_REQUESTED;
}
