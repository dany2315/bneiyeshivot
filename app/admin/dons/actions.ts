"use server";

import { revalidatePath } from "next/cache";
import {
  CerfaReceiptType,
  DonationFrequency,
  DonationSource,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  ReceiptStatus,
} from "@prisma/client";
import { ensureCerfaReceiptForDonation } from "@/lib/cerfa";
import {
  formatDonationFrequency,
  formatMoney,
  getStripe,
  nextReceiptNumber,
  readDonationAmount,
  receiptStatusFromNeeded,
} from "@/lib/donations";
import {
  donationThankYouEmail,
  sendEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function metadataObject(metadata: unknown) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {};
}

function receiptEmailForDonation(donation: {
  donorEmail: string;
  metadata: unknown;
}) {
  const receiptEmail = metadataObject(donation.metadata).receiptEmail;

  return typeof receiptEmail === "string" && receiptEmail.trim()
    ? receiptEmail.trim().toLowerCase()
    : donation.donorEmail;
}

function revalidateDonationAdminPages() {
  revalidatePath("/admin/dons");
  revalidatePath("/admin/recus");
}

function paidAtFromForm(formData: FormData, fallback = new Date()) {
  const value = readString(formData, "paidAt");

  if (!value) return fallback;

  const date = new Date(`${value}T12:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? fallback : date;
}

function receiptMetadataFromForm(formData: FormData) {
  const donorType = readString(formData, "donorType") === "ENTREPRISE"
    ? "ENTREPRISE"
    : "PARTICULIER";
  const companyName = readString(formData, "companyName");

  return {
    donorType,
    companyName: donorType === "ENTREPRISE" ? companyName || null : null,
    companyLegalForm:
      donorType === "ENTREPRISE"
        ? readString(formData, "companyLegalForm") || null
        : null,
    receiptEmail: readString(formData, "receiptEmail").toLowerCase() || null,
    receipt: {
      type: donorType,
      address: readString(formData, "receiptAddress"),
      zip: readString(formData, "receiptZip"),
      city: readString(formData, "receiptCity"),
      country: readString(formData, "receiptCountry") || "France",
      taxId: donorType === "ENTREPRISE" ? readString(formData, "receiptTaxId") : "",
    },
  } satisfies Prisma.InputJsonObject;
}

async function sendDonationPaymentReceiptEmail(
  donationId: string,
  actorId: string,
) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { receipt: true },
  });

  if (!donation) {
    throw new Error("Don introuvable.");
  }

  const metadata = metadataObject(donation.metadata);
  const stripeReceiptUrl =
    typeof metadata.stripeReceiptUrl === "string" ? metadata.stripeReceiptUrl : null;
  const email = await donationThankYouEmail({
    donorName: donation.donorName,
    amount: formatMoney(donation.amountCents, donation.currency),
    frequency: formatDonationFrequency(donation.frequency, donation.recurringMonths),
    receiptNumber: donation.receipt?.number,
    stripeReceiptUrl,
  });
  const to = receiptEmailForDonation(donation);
  const sent = await sendEmail({
    to,
    subject: email.subject,
    html: email.html,
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: sent.ok
        ? "donation.payment_receipt_email_sent"
        : "donation.payment_receipt_email_failed",
      entity: "Donation",
      entityId: donation.id,
      metadata: { to },
    },
  });

  if (sent.ok) {
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        metadata: {
          ...metadata,
          paymentReceiptEmailSentAt: new Date().toISOString(),
          paymentReceiptEmailSentTo: to,
        },
      },
    });
  }

  return sent.ok;
}

async function sendDonationCerfaEmail(donationId: string, actorId: string) {
  await prisma.donation.update({
    where: { id: donationId },
    data: { receiptNeeded: true },
  });
  const cerfa = await ensureCerfaReceiptForDonation(donationId);
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { receipt: true },
  });

  if (!donation) {
    throw new Error("Don introuvable.");
  }

  if (!cerfa) {
    throw new Error("Cerfa introuvable.");
  }

  const metadata = metadataObject(donation.metadata);
  const email = await donationThankYouEmail({
    donorName: donation.donorName,
    amount: formatMoney(donation.amountCents, donation.currency),
    frequency: formatDonationFrequency(donation.frequency, donation.recurringMonths),
    receiptNumber: cerfa.receipt.number,
  });
  const to = receiptEmailForDonation(donation);
  const sent = await sendEmail({
    to,
    subject: email.subject,
    html: email.html,
    attachments: [
      {
        filename: `${cerfa.receipt.number}.pdf`,
        content: cerfa.pdf.toString("base64"),
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: sent.ok ? "donation.cerfa_email_sent" : "donation.cerfa_email_failed",
      entity: "Donation",
      entityId: donation.id,
      metadata: { to, receiptNumber: cerfa.receipt.number },
    },
  });

  if (sent.ok) {
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        receiptStatus: ReceiptStatus.SENT,
        metadata: {
          ...metadata,
          cerfaEmailSentAt: new Date().toISOString(),
          cerfaEmailSentTo: to,
        },
      },
    });
  }

  return sent.ok;
}

export async function createManualDonation(formData: FormData) {
  const admin = await requireAdminUser();
  const amountCents = readDonationAmount(formData.get("amount"));
  const currency = readString(formData, "currency").toUpperCase() || "EUR";
  const firstName = readString(formData, "firstName");
  const lastName = readString(formData, "lastName");
  const email = readString(formData, "email").toLowerCase();
  const phone = readString(formData, "phone");
  const source = readString(formData, "source") as DonationSource;
  const status = readString(formData, "status") as PaymentStatus;
  const sendPaymentReceipt = formData.get("sendPaymentReceipt") === "on";
  const sendCerfaReceipt = formData.get("sendCerfaReceipt") === "on";

  if (
    !amountCents ||
    !email ||
    !Object.values(DonationSource).includes(source) ||
    source === DonationSource.ONLINE ||
    !Object.values(PaymentStatus).includes(status)
  ) {
    throw new Error("Don manuel invalide.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const donation = await prisma.donation.create({
    data: {
      userId: user?.id,
      provider: PaymentProvider.STRIPE,
      source,
      status,
      frequency: DonationFrequency.ONE_TIME,
      amountCents,
      currency,
      donorEmail: email,
      donorFirstName: firstName || null,
      donorLastName: lastName || null,
      donorName: [firstName, lastName].filter(Boolean).join(" ") || email,
      donorPhone: phone || null,
      dedication: readString(formData, "dedication") || null,
      receiptNeeded: status === PaymentStatus.PAID,
      receiptStatus: status === PaymentStatus.PAID
        ? ReceiptStatus.GENERATED
        : receiptStatusFromNeeded(false),
      paidAt: status === PaymentStatus.PAID ? paidAtFromForm(formData) : null,
      metadata: {
        ...receiptMetadataFromForm(formData),
        manual: true,
        paymentReference: readString(formData, "paymentReference") || null,
        createdBy: admin.id,
        adminNote: readString(formData, "adminNote") || null,
      },
    },
  });

  if (status === PaymentStatus.PAID) {
    await upsertReceiptForDonation(donation.id, formData);
    await ensureCerfaReceiptForDonation(donation.id);

    if (sendPaymentReceipt) {
      await sendDonationPaymentReceiptEmail(donation.id, admin.id);
    }

    if (sendCerfaReceipt) {
      await sendDonationCerfaEmail(donation.id, admin.id);
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.manual_created",
      entity: "Donation",
      entityId: donation.id,
      metadata: { source, amountCents, currency },
    },
  });

  revalidateDonationAdminPages();
}

export async function upsertReceiptForDonation(
  donationId: string,
  formData: FormData,
) {
  const receiptType = readString(formData, "receiptType") as CerfaReceiptType;
  const fiscalYear =
    Number(readString(formData, "fiscalYear")) || new Date().getFullYear();
  const donorType = readString(formData, "donorType") === "ENTREPRISE"
    ? "ENTREPRISE"
    : "PARTICULIER";
  const companyName = readString(formData, "companyName");
  const donorName =
    donorType === "ENTREPRISE"
      ? companyName
      : readString(formData, "receiptDonorName");

  if (!Object.values(CerfaReceiptType).includes(receiptType)) {
    throw new Error("Type de Cerfa invalide.");
  }

  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { receipt: true },
  });

  if (!donation) {
    throw new Error("Don introuvable.");
  }

  const metadata = metadataObject(donation.metadata);
  const cerfaWasIssued =
    donation.receiptStatus === ReceiptStatus.SENT ||
    typeof metadata.cerfaEmailSentAt === "string";
  const regenerateReceiptNumber =
    formData.get("regenerateReceiptNumber") === "on" && cerfaWasIssued;

  const receiptData = {
    type: receiptType,
    fiscalYear,
    donorName: donorName || donation.donorName || donation.donorEmail,
    donorAddress: readString(formData, "receiptAddress") || null,
    donorZip: readString(formData, "receiptZip") || null,
    donorCity: readString(formData, "receiptCity") || null,
    donorCountry: readString(formData, "receiptCountry") || null,
    donorTaxId: readString(formData, "receiptTaxId") || null,
    legalNote: readString(formData, "legalNote") || null,
    metadata: {
      updatedFromAdmin: true,
      paymentSource: donation.source,
    },
  };

  if (donation.receipt) {
    if (regenerateReceiptNumber) {
      await prisma.$transaction(async (tx) => {
        await tx.receipt.update({
          where: { donationId },
          data: {
            ...receiptData,
            number: await nextReceiptNumber(fiscalYear, tx),
            fileKey: null,
            issuedAt: new Date(),
          },
        });
      });
    } else {
      await prisma.receipt.update({
        where: { donationId },
        data: receiptData,
      });
    }
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.receipt.create({
        data: {
          donationId,
          number: await nextReceiptNumber(fiscalYear, tx),
          ...receiptData,
        },
      });
    });
  }

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      receiptNeeded: true,
      receiptStatus: ReceiptStatus.GENERATED,
      metadata: {
        ...metadata,
        ...receiptMetadataFromForm(formData),
        cerfaRegeneratedAt: new Date().toISOString(),
      },
    },
  });
}

export async function saveDonationReceipt(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");

  if (!donationId) {
    throw new Error("Don introuvable.");
  }

  await upsertReceiptForDonation(donationId, formData);
  await ensureCerfaReceiptForDonation(donationId);

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.receipt_saved",
      entity: "Donation",
      entityId: donationId,
    },
  });

  revalidateDonationAdminPages();
}

export async function updateDonationStatus(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");
  const status = readString(formData, "status") as PaymentStatus;

  if (!donationId || !Object.values(PaymentStatus).includes(status)) {
    throw new Error("Statut invalide.");
  }

  const donation = await prisma.donation.update({
    where: { id: donationId },
    data: {
      status,
      canceledAt: status === PaymentStatus.CANCELED ? new Date() : undefined,
      paidAt: status === PaymentStatus.PAID ? paidAtFromForm(formData) : undefined,
      receiptNeeded: status === PaymentStatus.PAID ? true : undefined,
    },
  });

  if (donation.source !== DonationSource.ONLINE && status === PaymentStatus.PAID) {
    await ensureCerfaReceiptForDonation(donation.id);
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.status_updated",
      entity: "Donation",
      entityId: donationId,
      metadata: { status },
    },
  });

  revalidateDonationAdminPages();
}

export async function updateDonationDetails(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { receipt: true },
  });

  if (!donation) {
    throw new Error("Don introuvable.");
  }

  const firstName = readString(formData, "firstName");
  const lastName = readString(formData, "lastName");
  const fiscalEmail = readString(formData, "receiptEmail").toLowerCase();
  const isManual = donation.source !== DonationSource.ONLINE;
  const data: Prisma.DonationUpdateInput = {
    donorFirstName: isManual ? firstName || null : donation.donorFirstName,
    donorLastName: isManual ? lastName || null : donation.donorLastName,
    donorName: isManual
      ? [firstName, lastName].filter(Boolean).join(" ") || donation.donorEmail
      : donation.donorName,
    donorPhone: readString(formData, "phone") || null,
    dedication: isManual
      ? readString(formData, "dedication") || null
      : donation.dedication,
    metadata: {
      ...metadataObject(donation.metadata),
      ...receiptMetadataFromForm(formData),
      receiptEmail: fiscalEmail || null,
      adminNote: readString(formData, "adminNote") || null,
      fiscalUpdatedAt: new Date().toISOString(),
      fiscalUpdatedBy: admin.id,
    },
  };

  if (isManual) {
    const source = readString(formData, "source") as DonationSource;
    const status = readString(formData, "status") as PaymentStatus;

    if (
      !Object.values(DonationSource).includes(source) ||
      source === DonationSource.ONLINE ||
      !Object.values(PaymentStatus).includes(status)
    ) {
      throw new Error("Modification manuelle invalide.");
    }

    data.amountCents = readDonationAmount(formData.get("amount"));
    data.currency = readString(formData, "currency").toUpperCase() || donation.currency;
    data.source = source;
    data.status = status;
    data.paidAt =
      data.status === PaymentStatus.PAID ? paidAtFromForm(formData, donation.paidAt ?? new Date()) : null;
  }

  await prisma.donation.update({
    where: { id: donation.id },
    data,
  });

  await upsertReceiptForDonation(donation.id, formData);
  await ensureCerfaReceiptForDonation(donation.id);

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: isManual
        ? "donation.manual_updated"
        : "donation.fiscal_details_updated",
      entity: "Donation",
      entityId: donation.id,
    },
  });

  revalidateDonationAdminPages();
}

export async function sendPaymentReceipt(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");

  await sendDonationPaymentReceiptEmail(donationId, admin.id);
  revalidateDonationAdminPages();
}

export async function sendCerfaReceipt(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");

  await sendDonationCerfaEmail(donationId, admin.id);
  revalidateDonationAdminPages();
}

export async function deleteManualDonation(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { receipt: true },
  });

  if (!donation || donation.source === DonationSource.ONLINE) {
    throw new Error("Seuls les dons manuels peuvent être supprimés.");
  }

  await prisma.receipt.deleteMany({ where: { donationId: donation.id } });
  await prisma.donation.delete({ where: { id: donation.id } });
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.manual_deleted",
      entity: "Donation",
      entityId: donation.id,
      metadata: { amountCents: donation.amountCents, donorEmail: donation.donorEmail },
    },
  });

  revalidateDonationAdminPages();
}

export async function updateDonationReceiptStatus(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");
  const receiptStatus = readString(formData, "receiptStatus") as ReceiptStatus;

  if (!donationId || !Object.values(ReceiptStatus).includes(receiptStatus)) {
    throw new Error("Statut de reçu invalide.");
  }

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      receiptNeeded: receiptStatus !== ReceiptStatus.NOT_REQUESTED,
      receiptStatus,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.receipt_status_updated",
      entity: "Donation",
      entityId: donationId,
      metadata: { receiptStatus },
    },
  });

  revalidateDonationAdminPages();
}

export async function updateDonationAdminNote(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");
  const adminNote = readString(formData, "adminNote");
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    select: { metadata: true },
  });

  if (!donation) {
    throw new Error("Don introuvable.");
  }

  const currentMetadata =
    donation.metadata &&
    typeof donation.metadata === "object" &&
    !Array.isArray(donation.metadata)
      ? (donation.metadata as Record<string, unknown>)
      : {};

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      metadata: {
        ...currentMetadata,
        adminNote,
        adminNoteUpdatedBy: admin.id,
        adminNoteUpdatedAt: new Date().toISOString(),
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.admin_note_updated",
      entity: "Donation",
      entityId: donationId,
    },
  });

  revalidateDonationAdminPages();
}

export async function refundDonation(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");
  const amount = readString(formData, "refundAmount");
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });

  if (!donation || !donation.stripePaymentIntentId) {
    throw new Error("Paiement Stripe introuvable pour ce don.");
  }

  const refundAmountCents = amount
    ? readDonationAmount(amount)
    : donation.amountCents - donation.refundedAmountCents;

  if (refundAmountCents <= 0) {
    throw new Error("Montant de remboursement invalide.");
  }

  await getStripe().refunds.create({
    payment_intent: donation.stripePaymentIntentId,
    amount: refundAmountCents,
    metadata: {
      donationId,
      adminId: admin.id,
    },
  });

  const totalRefunded = donation.refundedAmountCents + refundAmountCents;

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      refundedAmountCents: totalRefunded,
      refundedAt: new Date(),
      status:
        totalRefunded >= donation.amountCents
          ? PaymentStatus.REFUNDED
          : PaymentStatus.PARTIALLY_REFUNDED,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.refunded",
      entity: "Donation",
      entityId: donationId,
      metadata: { refundAmountCents },
    },
  });

  revalidateDonationAdminPages();
}
