"use server";

import { revalidatePath } from "next/cache";
import {
  CerfaReceiptType,
  DonationFrequency,
  DonationSource,
  PaymentStatus,
  ReceiptStatus,
} from "@prisma/client";
import { ensureCerfaReceiptForDonation } from "@/lib/cerfa";
import {
  getStripe,
  nextReceiptNumber,
  readDonationAmount,
  receiptStatusFromNeeded,
} from "@/lib/donations";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
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
  const receiptNeeded = formData.get("receiptNeeded") === "on";
  const createReceipt = formData.get("createReceipt") === "on";

  if (!amountCents || !email || !Object.values(DonationSource).includes(source)) {
    throw new Error("Don manuel invalide.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const donation = await prisma.donation.create({
    data: {
      userId: user?.id,
      provider: "STRIPE",
      source,
      status: PaymentStatus.PAID,
      frequency: DonationFrequency.ONE_TIME,
      amountCents,
      currency,
      donorEmail: email,
      donorFirstName: firstName || null,
      donorLastName: lastName || null,
      donorName: [firstName, lastName].filter(Boolean).join(" ") || email,
      donorPhone: phone || null,
      dedication: readString(formData, "dedication") || null,
      receiptNeeded,
      receiptStatus: createReceipt
        ? ReceiptStatus.GENERATED
        : receiptStatusFromNeeded(receiptNeeded),
      paidAt: new Date(),
      metadata: {
        manual: true,
        createdBy: admin.id,
      },
    },
  });

  if (createReceipt) {
    await upsertReceiptForDonation(donation.id, formData);
    await ensureCerfaReceiptForDonation(donation.id);
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

  revalidatePath("/admin/dons");
}

export async function upsertReceiptForDonation(
  donationId: string,
  formData: FormData,
) {
  const receiptType = readString(formData, "receiptType") as CerfaReceiptType;
  const fiscalYear =
    Number(readString(formData, "fiscalYear")) || new Date().getFullYear();
  const donorName = readString(formData, "receiptDonorName");

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
    await prisma.receipt.update({
      where: { donationId },
      data: receiptData,
    });
  } else {
    await prisma.receipt.create({
      data: {
        donationId,
        number: await nextReceiptNumber(fiscalYear),
        ...receiptData,
      },
    });
  }

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      receiptNeeded: true,
      receiptStatus: ReceiptStatus.GENERATED,
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

  revalidatePath("/admin/dons");
}

export async function updateDonationStatus(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");
  const status = readString(formData, "status") as PaymentStatus;

  if (!donationId || !Object.values(PaymentStatus).includes(status)) {
    throw new Error("Statut invalide.");
  }

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      status,
      canceledAt: status === PaymentStatus.CANCELED ? new Date() : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.status_updated",
      entity: "Donation",
      entityId: donationId,
      metadata: { status },
    },
  });

  revalidatePath("/admin/dons");
}

export async function updateDonationReceiptStatus(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");
  const receiptStatus = readString(formData, "receiptStatus") as ReceiptStatus;

  if (!donationId || !Object.values(ReceiptStatus).includes(receiptStatus)) {
    throw new Error("Statut de recu invalide.");
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

  revalidatePath("/admin/dons");
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

  revalidatePath("/admin/dons");
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

  revalidatePath("/admin/dons");
}
