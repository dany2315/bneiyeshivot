import {
  DonationFrequency,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  ReceiptStatus,
} from "@prisma/client";
import {
  donationAdminNotificationEmail,
  donationThankYouEmail,
  sendEmail,
} from "@/lib/email";
import {
  formatDonationFrequency,
  formatMoney,
  getBaseUrl,
  readDonationAmount,
} from "@/lib/donations";
import { prisma } from "@/lib/prisma";

export const NEDARIM_IFRAME_ORIGIN = "https://matara.pro";
export const NEDARIM_WWW_IFRAME_ORIGIN = "https://www.matara.pro";
export const NEDARIM_IFRAME_URL =
  "https://www.matara.pro/nedarimplus/iframe/?language=en&Picture=Hide";
export const NEDARIM_CALLBACK_IPS = ["18.196.146.117", "18.194.219.73"];
const NEDARIM_REPORTS_URL = "https://matara.pro/nedarimplus/Reports/Tamal3.aspx";

export type NedarimPaymentFields = {
  Mosad: string;
  ApiValid: string;
  PaymentType: "Ragil" | "HK";
  Currency: "1";
  Zeout: string;
  FirstName: string;
  LastName: string;
  Street: string;
  City: string;
  Phone: string;
  Mail: string;
  Amount: string;
  Tashlumim: string;
  Groupe: string;
  Comment: string;
  Param1: string;
  Param2: string;
  ForceUpdateMatching: string;
  ThirdPartyReceipt: string;
  CallBack: string;
  CallBackMailError: string;
  Tokef: string;
};

function metadataObject(metadata: unknown) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {};
}

function nedarimMosadId() {
  return process.env.NEDARIM_PLUS_MOSAD_ID || "";
}

function nedarimApiValid() {
  return process.env.NEDARIM_PLUS_API_VALID || "";
}

function nedarimApiPassword() {
  return process.env.NEDARIM_PLUS_API_PASSWORD || "";
}

function callbackErrorEmail() {
  return process.env.NEDARIM_PLUS_CALLBACK_ERROR_EMAIL || "";
}

function callbackUrl() {
  const configured = process.env.NEDARIM_PLUS_CALLBACK_URL;

  if (configured) return configured;

  return `${getBaseUrl()}/api/dons/nedarim-plus/callback`;
}

function responseReceiptUrl(response: Record<string, unknown>) {
  const keys = [
    "ReceiptUrl",
    "receiptUrl",
    "MasofReceiptUrl",
    "DocumentUrl",
    "InvoiceUrl",
    "Url",
    "Link",
  ];

  for (const key of keys) {
    const value = response[key];

    if (typeof value === "string" && /^https?:\/\//.test(value)) {
      return value;
    }
  }

  return null;
}

function responseTransactionId(response: Record<string, unknown>) {
  const keys = [
    "TransactionId",
    "TransactionID",
    "Transaction",
    "ID",
    "Id",
    "MasofId",
  ];

  for (const key of keys) {
    const value = response[key];

    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }

  return "";
}

async function fetchNedarimReceiptUrl(transactionId: string) {
  if (!transactionId || !nedarimApiPassword()) return null;

  const formData = new URLSearchParams({
    Action: "ShowInvoice",
    MosadNumber: nedarimMosadId(),
    ApiPassword: nedarimApiPassword(),
    TransactionId: transactionId,
    AchnasotId: "",
  });

  const response = await fetch(NEDARIM_REPORTS_URL, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) return null;

  const payload = (await response.json().catch(() => null)) as
    | { Result?: string; Message?: string }
    | null;
  const message = payload?.Message;

  if (payload?.Result !== "OK" || !message || !/^https?:\/\//.test(message)) {
    return null;
  }

  return message;
}

export function isNedarimPlusConfigured() {
  return (
    process.env.NEDARIM_PLUS_ENABLED === "true" &&
    Boolean(nedarimMosadId()) &&
    Boolean(nedarimApiValid())
  );
}

export function readNedarimAmountCents(formData: FormData) {
  const customAmount = String(formData.get("customAmount") ?? "").trim();

  return readDonationAmount(customAmount || formData.get("amount"));
}

export function readNedarimFrequency(formData: FormData) {
  return formData.get("frequency") === "MONTHLY"
    ? DonationFrequency.MONTHLY
    : DonationFrequency.ONE_TIME;
}

export function readNedarimRecurringMonths(
  formData: FormData,
  frequency: DonationFrequency,
) {
  if (frequency !== DonationFrequency.MONTHLY) return null;

  const months = Number(String(formData.get("recurringMonths") ?? "").trim());

  if (!Number.isInteger(months) || months < 0 || months > 120) {
    return 12;
  }

  return months;
}

export function buildNedarimPaymentFields({
  amountCents,
  dedication,
  donationId,
  email,
  firstName,
  frequency,
  lastName,
  nedarimCity,
  nedarimStreet,
  nedarimZeout,
  phone,
  recurringMonths,
}: {
  amountCents: number;
  dedication: string;
  donationId: string;
  email: string;
  firstName: string;
  frequency: DonationFrequency;
  lastName: string;
  nedarimCity: string;
  nedarimStreet: string;
  nedarimZeout: string;
  phone: string;
  recurringMonths: number | null;
}): NedarimPaymentFields {
  return {
    Mosad: nedarimMosadId(),
    ApiValid: nedarimApiValid(),
    PaymentType: frequency === DonationFrequency.MONTHLY ? "HK" : "Ragil",
    Currency: "1",
    Zeout: nedarimZeout.replace(/\D/g, "").slice(0, 9),
    FirstName: firstName.slice(0, 50),
    LastName: lastName.slice(0, 50),
    Street: nedarimStreet.slice(0, 100),
    City: nedarimCity.slice(0, 100),
    Phone: phone.replace(/\D/g, "").slice(0, 20),
    Mail: email.slice(0, 50),
    Amount: String(amountCents / 100),
    Tashlumim:
      frequency === DonationFrequency.MONTHLY
        ? recurringMonths && recurringMonths > 0
          ? String(recurringMonths)
          : ""
        : "1",
    Groupe: "Bnei Yeshivot",
    Comment: (dedication || `Don Bnei Yeshivot ${donationId}`).slice(0, 300),
    Param1: donationId,
    Param2: "",
    ForceUpdateMatching: "1",
    ThirdPartyReceipt: "",
    CallBack: callbackUrl(),
    CallBackMailError: callbackErrorEmail(),
    Tokef: "",
  };
}

export async function createPendingNedarimDonation({
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
}: {
  amountCents: number;
  companyLegalForm: string;
  companyName: string;
  dedication: string;
  donorType: "PARTICULIER" | "ENTREPRISE";
  email: string;
  firstName: string;
  frequency: DonationFrequency;
  lastName: string;
  nedarimCity: string;
  nedarimStreet: string;
  nedarimZeout: string;
  phone: string;
  recurringMonths: number | null;
}) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return prisma.donation.create({
    data: {
      userId: user?.id,
      provider: PaymentProvider.NEDARIM_PLUS,
      status: PaymentStatus.PENDING,
      frequency,
      recurringMonths,
      amountCents,
      currency: "ILS",
      donorEmail: email,
      donorFirstName: firstName || null,
      donorLastName: lastName || null,
      donorName: [firstName, lastName].filter(Boolean).join(" ") || email,
      donorPhone: phone || null,
      dedication: dedication || null,
      receiptNeeded: false,
      receiptStatus: ReceiptStatus.NOT_REQUESTED,
      metadata: {
        donorType,
        companyName: companyName || null,
        companyLegalForm: companyLegalForm || null,
        fiscalNotice: "ILS_NEDARIM_NO_CERFA",
        nedarimPlusDonorData: {
          zeout: nedarimZeout || null,
          street: nedarimStreet || null,
          city: nedarimCity || null,
        },
      },
    },
  });
}

export async function markNedarimDonationFromResponse({
  donationId,
  response,
  status,
}: {
  donationId: string;
  response: Record<string, unknown>;
  status: PaymentStatus;
}) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { payments: true },
  });

  if (!donation || donation.provider !== PaymentProvider.NEDARIM_PLUS) {
    throw new Error("Don Nedarim Plus introuvable.");
  }

  const metadata = metadataObject(donation.metadata);
  const transactionId = responseTransactionId(response);
  const paymentReceiptUrl =
    responseReceiptUrl(response) ??
    (status === PaymentStatus.PAID
      ? await fetchNedarimReceiptUrl(transactionId)
      : null);
  const paidAt = status === PaymentStatus.PAID ? donation.paidAt ?? new Date() : null;

  await prisma.$transaction([
    prisma.donation.update({
      where: { id: donation.id },
      data: {
        status,
        paidAt: status === PaymentStatus.PAID ? paidAt : undefined,
        failureReason:
          status === PaymentStatus.FAILED
            ? String(response.Message ?? "Paiement refuse par Nedarim Plus")
            : null,
        metadata: {
          ...metadata,
          paymentReceiptUrl,
          nedarimPlus: {
            transactionId: transactionId || null,
            response,
            receiptUrl: paymentReceiptUrl,
          },
        } as Prisma.InputJsonObject,
      },
    }),
    prisma.donationPayment.upsert({
      where: { id: donation.payments[0]?.id ?? "__missing__" },
      create: {
        donationId: donation.id,
        amountCents: donation.amountCents,
        currency: donation.currency,
        installmentNumber: 1,
        installmentTotal:
          donation.frequency === DonationFrequency.MONTHLY
            ? donation.recurringMonths
            : 1,
        billingReason:
          donation.frequency === DonationFrequency.MONTHLY
            ? "nedarim_hk"
            : "nedarim_ragil",
        status,
        paidAt,
        stripeReceiptUrl: paymentReceiptUrl,
        failedAt: status === PaymentStatus.FAILED ? new Date() : null,
        failureReason:
          status === PaymentStatus.FAILED
            ? String(response.Message ?? "Paiement refuse par Nedarim Plus")
            : null,
        metadata: {
          transactionId: transactionId || null,
          paymentReceiptUrl,
          response,
        } as Prisma.InputJsonObject,
      },
      update: {
        status,
        paidAt: status === PaymentStatus.PAID ? paidAt : undefined,
        stripeReceiptUrl: paymentReceiptUrl ?? undefined,
        failedAt: status === PaymentStatus.FAILED ? new Date() : undefined,
        failureReason:
          status === PaymentStatus.FAILED
            ? String(response.Message ?? "Paiement refuse par Nedarim Plus")
            : null,
        metadata: {
          transactionId: transactionId || null,
          paymentReceiptUrl,
          response,
        } as Prisma.InputJsonObject,
      },
    }),
  ]);

  if (status === PaymentStatus.PAID) {
    await sendNedarimDonationEmails(donation.id);
  } else if (status === PaymentStatus.FAILED) {
    await sendNedarimDonationFailureAdminEmail(donation.id);
  }
}

async function sendNedarimDonationFailureAdminEmail(donationId: string) {
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });

  if (!donation || donation.status !== PaymentStatus.FAILED) {
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
  const adminEmail = await donationAdminNotificationEmail({
    adminLink: `${getBaseUrl()}/admin/dons?q=${encodeURIComponent(donation.id)}`,
    amount,
    donorEmail: donation.donorEmail,
    donorName: donation.donorName,
    donorPhone: donation.donorPhone,
    failureReason: donation.failureReason,
    frequency,
    heading: "Don en échec",
    paymentStatusLabel: "Échec",
    receiptNumber: "Non applicable",
  });
  const sent = await sendEmail({
    to: "contact@bneiyeshivot.com",
    subject: adminEmail.subject,
    html: adminEmail.html,
  });

  if (!sent.ok) {
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
}

export async function sendNedarimDonationEmails(donationId: string) {
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });

  if (!donation || donation.status !== PaymentStatus.PAID) return;

  const metadata = metadataObject(donation.metadata);

  if (metadata.thankYouEmailSentAt && metadata.adminDonationEmailSentAt) {
    return;
  }

  const amount = formatMoney(donation.amountCents, donation.currency);
  const frequency = formatDonationFrequency(
    donation.frequency,
    donation.recurringMonths,
  );
  const nextMetadata = { ...metadata };

  if (!metadata.thankYouEmailSentAt) {
    const email = await donationThankYouEmail({
      donorName: donation.donorName,
      amount,
      frequency,
    });
    const sent = await sendEmail({
      to: donation.donorEmail,
      subject: email.subject,
      html: email.html,
    });

    if (sent.ok) nextMetadata.thankYouEmailSentAt = new Date().toISOString();
  }

  if (!metadata.adminDonationEmailSentAt) {
    const adminEmail = await donationAdminNotificationEmail({
      adminLink: `${getBaseUrl()}/admin/dons?q=${encodeURIComponent(donation.id)}`,
      amount,
      donorEmail: donation.donorEmail,
      donorName: donation.donorName,
      donorPhone: donation.donorPhone,
      frequency,
      heading: "Nouveau don confirmé",
      receiptNumber: "Non applicable",
    });
    const sent = await sendEmail({
      to: process.env.ADMIN_DONATION_EMAIL || "contact@bneiyeshivot.com",
      subject: adminEmail.subject,
      html: adminEmail.html,
    });

    if (sent.ok) nextMetadata.adminDonationEmailSentAt = new Date().toISOString();
  }

  await prisma.donation.update({
    where: { id: donation.id },
    data: { metadata: nextMetadata as Prisma.InputJsonObject },
  });
}
