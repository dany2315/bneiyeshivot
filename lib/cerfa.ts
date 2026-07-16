import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Donation, Receipt } from "@prisma/client";
import { CerfaReceiptType, ReceiptStatus } from "@prisma/client";
import { nextReceiptNumber } from "@/lib/donations";
import { prisma } from "@/lib/prisma";
import { uploadBufferToS3 } from "@/lib/uploads";

type DonationWithReceipt = Donation & {
  receipt: Receipt | null;
};

const CERFA_TEMPLATE_PATH = path.join(
  process.cwd(),
  "assets",
  "cerfa",
  "cerfa-entreprise-torat-yaacov.pdf",
);

function metadataObject(metadata: unknown) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {};
}

function metadataText(metadata: unknown, key: string) {
  const value = metadataObject(metadata)[key];

  return typeof value === "string" ? value : null;
}

function receiptMetadata(donation: Donation) {
  const metadata = metadataObject(donation.metadata);
  const receipt = metadataObject(metadataObject(donation.metadata).receipt);
  const donorType = metadataText(metadata, "donorType");
  const companyName = metadataText(metadata, "companyName");
  const companyLegalForm = metadataText(metadata, "companyLegalForm");
  const type =
    donorType === "ENTREPRISE"
      ? CerfaReceiptType.ENTREPRISE
      : CerfaReceiptType.PARTICULIER;

  return {
    type,
    address: typeof receipt.address === "string" ? receipt.address : null,
    zip: typeof receipt.zip === "string" ? receipt.zip : null,
    city: typeof receipt.city === "string" ? receipt.city : null,
    country: typeof receipt.country === "string" ? receipt.country : "France",
    taxId:
      type === CerfaReceiptType.ENTREPRISE && typeof receipt.taxId === "string"
        ? receipt.taxId
        : null,
    companyName,
    companyLegalForm,
  };
}

function moneyLabel(amountCents: number, currency: string) {
  const amount = amountCents / 100;

  if (currency === "EUR") {
    return `${new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    })
      .format(amount)
      .replace(/\s/g, " ")}€`;
  }

  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  })
    .format(amount)
    .replace(/\s/g, " ")} ${currency}`;
}

const smallNumbers = [
  "zero",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
];

const tens = [
  "",
  "",
  "vingt",
  "trente",
  "quarante",
  "cinquante",
  "soixante",
];

function underHundred(value: number): string {
  if (value < 17) return smallNumbers[value];
  if (value < 20) return `dix-${smallNumbers[value - 10]}`;
  if (value < 70) {
    const ten = Math.floor(value / 10);
    const rest = value % 10;
    if (rest === 0) return tens[ten];
    if (rest === 1) return `${tens[ten]} et un`;
    return `${tens[ten]}-${smallNumbers[rest]}`;
  }
  if (value < 80) return `soixante-${underHundred(value - 60)}`;
  if (value === 80) return "quatre-vingts";
  return `quatre-vingt-${underHundred(value - 80)}`;
}

function underThousand(value: number): string {
  if (value < 100) return underHundred(value);
  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  const prefix = hundred === 1 ? "cent" : `${smallNumbers[hundred]} cent`;
  if (rest === 0) return hundred > 1 ? `${prefix}s` : prefix;
  return `${prefix} ${underHundred(rest)}`;
}

function amountInWords(amountCents: number, currency: string) {
  const amount = Math.round(amountCents / 100);

  if (amount <= 0) return currency === "EUR" ? "zero Euro" : `zero ${currency}`;
  if (amount < 1000) {
    return `${underThousand(amount)} ${currency === "EUR" ? "Euros" : currency}`;
  }

  const thousands = Math.floor(amount / 1000);
  const rest = amount % 1000;
  const prefix = thousands === 1 ? "mille" : `${underThousand(thousands)} mille`;

  return `${prefix}${rest ? ` ${underThousand(rest)}` : ""} ${
    currency === "EUR" ? "Euros" : currency
  }`;
}

function frenchDate(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function whiteout(page: import("pdf-lib").PDFPage, x: number, y: number, width: number, height: number) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(1, 1, 1),
    borderColor: rgb(1, 1, 1),
  });
}

export async function renderCerfaReceiptPdf({
  donation,
  receipt,
}: {
  donation: Donation;
  receipt: Receipt;
}) {
  const meta = receiptMetadata(donation);
  const paidAt = donation.paidAt ?? donation.createdAt;
  const template = await readFile(CERFA_TEMPLATE_PATH);
  const pdf = await PDFDocument.load(template);
  const page = pdf.getPage(0);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const textColor = rgb(0, 0, 0);

  whiteout(page, 438, 774, 56, 12);
  page.drawText(receipt.number, {
    x: 439,
    y: 779,
    size: 8.75,
    font: bold,
    color: textColor,
  });

  whiteout(page, 59, 451, 476, 61);
  page.drawText("Denomination de l'entreprise : ", {
    x: 59.5,
    y: 495,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  page.drawText(receipt.donorName || donation.donorEmail, {
    x: 191,
    y: 495,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("Forme juridique : ", {
    x: 59.5,
    y: 484,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  page.drawText(meta.companyLegalForm || "-", {
    x: 126,
    y: 484,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("N° SIREN : ", {
    x: 59.5,
    y: 473,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  page.drawText(receipt.donorTaxId || "-", {
    x: 105,
    y: 473,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("Adresse : ", {
    x: 59.5,
    y: 451,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  page.drawText(receipt.donorAddress || "-", {
    x: 98,
    y: 451,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("Code Postal : ", {
    x: 59.5,
    y: 436.5,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  page.drawText(receipt.donorZip || "-", {
    x: 116,
    y: 436.5,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("Commune : ", {
    x: 297,
    y: 436.5,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  page.drawText(receipt.donorCity || "-", {
    x: 343,
    y: 436.5,
    size: 8.75,
    font: bold,
    color: textColor,
  });

  whiteout(page, 58, 370, 477, 58);
  page.drawText(moneyLabel(donation.amountCents, donation.currency), {
    x: 282,
    y: 415,
    size: 12,
    font: regular,
    color: textColor,
  });
  page.drawText("Total des versements en toutes lettres : ", {
    x: 59.7,
    y: 384.9,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText(amountInWords(donation.amountCents, donation.currency), {
    x: 222,
    y: 384.9,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  page.drawText("Date du versement du don : ", {
    x: 59.7,
    y: 367.6,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  page.drawText(frenchDate(paidAt), {
    x: 169,
    y: 367.6,
    size: 8.75,
    font: bold,
    color: textColor,
  });

  whiteout(page, 416, 242, 92, 16);
  page.drawText(frenchDate(receipt.issuedAt), {
    x: 416,
    y: 250,
    size: 7.5,
    font: bold,
    color: textColor,
  });

  return Buffer.from(await pdf.save());
}

export async function ensureCerfaReceiptForDonation(donationId: string) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { receipt: true },
  });

  if (!donation || !donation.receiptNeeded) {
    return null;
  }

  const fiscalYear = (donation.paidAt ?? new Date()).getFullYear();
  const meta = receiptMetadata(donation);
  let receipt = donation.receipt;

  if (!receipt) {
    const donorName =
      meta.type === CerfaReceiptType.ENTREPRISE && meta.companyName
        ? meta.companyName
        : donation.donorName || donation.donorEmail;

    receipt = await prisma.receipt.create({
      data: {
        donationId: donation.id,
        number: await nextReceiptNumber(fiscalYear),
        type: meta.type,
        fiscalYear,
        donorName,
        donorAddress: meta.address,
        donorZip: meta.zip,
        donorCity: meta.city,
        donorCountry: meta.country,
        donorTaxId: meta.taxId,
      },
    });
  }

  const pdf = await renderCerfaReceiptPdf({ donation, receipt });
  let fileKey = receipt.fileKey;

  try {
    const uploaded = await uploadBufferToS3({
      body: pdf,
      contentType: "application/pdf",
      fileName: `${receipt.number}.pdf`,
      prefix: `donations/${donation.id}/receipts`,
    });
    fileKey = uploaded.key;
  } catch (error) {
    console.warn("[cerfa] upload S3 ignore", error);
  }

  const updatedReceipt = await prisma.receipt.update({
    where: { donationId: donation.id },
    data: { fileKey },
  });

  await prisma.donation.update({
    where: { id: donation.id },
    data: { receiptStatus: ReceiptStatus.GENERATED },
  });

  return {
    donation: { ...donation, receipt: updatedReceipt } as DonationWithReceipt,
    receipt: updatedReceipt,
    pdf,
  };
}
