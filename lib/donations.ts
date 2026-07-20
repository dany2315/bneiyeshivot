import {
  CerfaReceiptType,
  DonationFrequency,
  DonationSource,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  ReceiptStatus,
} from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const donationAmountOptions = [20, 50, 100, 180, 260, 500];

export const donationCurrencyOptions = [
  { value: "EUR", label: "EUR", provider: PaymentProvider.STRIPE },
  { value: "ILS", label: "ILS", provider: PaymentProvider.STRIPE },
] as const;

export const donationProviderLabels: Record<PaymentProvider, string> = {
  STRIPE: "Carte bancaire Stripe",
  NEDARIM_PLUS: "Carte bancaire ILS",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  PAID: "Réussi",
  FAILED: "Échec",
  REFUNDED: "Remboursé",
  PARTIALLY_REFUNDED: "Remboursement partiel",
  CANCELED: "Annulé",
};

export const donationFrequencyLabels: Record<DonationFrequency, string> = {
  ONE_TIME: "Ponctuel",
  MONTHLY: "Récurrent mensuel",
};

export function formatDonationFrequency(
  frequency: DonationFrequency,
  recurringMonths?: number | null,
) {
  if (frequency === DonationFrequency.ONE_TIME) {
    return donationFrequencyLabels.ONE_TIME;
  }

  if (!recurringMonths) {
    return "Récurrent mensuel sans limite";
  }

  return `Récurrent mensuel - ${recurringMonths} mois`;
}

export const donationSourceLabels: Record<DonationSource, string> = {
  ONLINE: "En ligne",
  ADMIN_CASH: "Espèces",
  ADMIN_CHECK: "Chèque",
  ADMIN_BANK_TRANSFER: "Virement",
  ADMIN_OTHER: "Autre",
};

export const receiptTypeLabels: Record<CerfaReceiptType, string> = {
  PARTICULIER: "Cerfa particulier",
  ENTREPRISE: "Cerfa entreprise",
  ISF_IFI: "Cerfa IFI",
  AUTRE: "Autre reçu",
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

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

function configuredBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "";
}

function isLocalUrl(url: string) {
  try {
    const { hostname } = new URL(url);

    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function trustedOrigins() {
  return (process.env.BETTER_AUTH_TRUSTED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function originMatches(origin: string, trustedOrigin: string) {
  if (!trustedOrigin.includes("*")) {
    return origin === normalizeBaseUrl(trustedOrigin);
  }

  try {
    const candidate = new URL(origin);
    const trusted = new URL(trustedOrigin.replace("*.", ""));
    const suffix = `.${trusted.hostname}`;

    return (
      candidate.protocol === trusted.protocol &&
      candidate.hostname.endsWith(suffix)
    );
  } catch {
    return false;
  }
}

function isTrustedOrigin(origin: string) {
  if (isLocalUrl(origin)) return true;

  return trustedOrigins().some((trustedOrigin) =>
    originMatches(origin, trustedOrigin),
  );
}

export function getBaseUrl() {
  return normalizeBaseUrl(configuredBaseUrl() || "http://localhost:3000");
}

export function getRequestBaseUrl(request: Request) {
  const configuredUrl = configuredBaseUrl();

  if (configuredUrl && !isLocalUrl(configuredUrl)) {
    return normalizeBaseUrl(configuredUrl);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");

  if (host) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const protocol =
      forwardedProto || (host.startsWith("localhost") ? "http" : "https");

    const requestOrigin = normalizeBaseUrl(`${protocol}://${host}`);

    if (isTrustedOrigin(requestOrigin)) {
      return requestOrigin;
    }
  }

  return getBaseUrl();
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY est manquant.");
  }

  return new Stripe(key);
}

export async function nextReceiptNumber(
  fiscalYear = new Date().getFullYear(),
  client: Prisma.TransactionClient | typeof prisma = prisma,
) {
  const sequence = await client.receiptSequence.upsert({
    where: { fiscalYear },
    create: {
      fiscalYear,
      lastNumber: 1,
    },
    update: {
      lastNumber: { increment: 1 },
    },
  });

  return `CERFA-${fiscalYear}-${String(sequence.lastNumber).padStart(5, "0")}`;
}

export function receiptStatusFromNeeded(receiptNeeded: boolean) {
  return receiptNeeded ? ReceiptStatus.REQUESTED : ReceiptStatus.NOT_REQUESTED;
}
