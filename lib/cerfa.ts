import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Donation, Receipt } from "@prisma/client";
import { CerfaReceiptType, DonationSource, ReceiptStatus } from "@prisma/client";
import { nextReceiptNumber } from "@/lib/donations";
import { prisma } from "@/lib/prisma";
import { deleteFileFromS3, uploadBufferToS3 } from "@/lib/uploads";

type DonationWithReceipt = Donation & {
  receipt: Receipt | null;
};

export const CERFA_ENTREPRISE_FIXED_DATA = {
  beneficiaryName: "Association Torat Yaacov",
  beneficiaryRna: "W932012476",
  beneficiaryAddress: "11 Bis avenue Joffre",
  beneficiaryPostalCode: "93220",
  beneficiaryCity: "Gagny",
  beneficiaryObject:
    "L’association a pour but d’aider les étudiants en leur proposant des cours, des repas et des bourses.",
  beneficiaryCategory:
    "Œuvre ou organisme d’intérêt général ayant un caractère philanthropique, éducatif, scientifique, social, humanitaire, sportif, familial, culturel ou concourant à la mise en valeur du patrimoine artistique, à la défense de l’environnement naturel ou à la diffusion de la culture, de la langue et des connaissances scientifiques françaises (Association Loi 1901).",
} as const;

export const CERFA_ENTREPRISE_VARIABLE_FIELDS = [
  "receiptNumber",
  "companyName",
  "companyLegalForm",
  "companySiren",
  "companyAddress",
  "companyPostalCode",
  "companyCity",
  "donationAmount",
  "donationAmountInWords",
  "donationPaidAt",
  "paymentMethod",
  "receiptIssuedAt",
] as const;

export const CERFA_PARTICULIER_FIXED_DATA = {
  beneficiaryName: "Association Torat Yaacov",
  beneficiaryRna: "W932012476",
  beneficiaryAddress: "11 Bis avenue Joffre",
  beneficiaryPostalCode: "93220",
  beneficiaryCity: "Gagny",
  beneficiaryObject:
    "L’association a pour but d’aider les étudiants en leur proposant des cours, des repas et des bourses.",
  beneficiaryCategory: "Œuvre ou organisme d’intérêt général",
} as const;

export const CERFA_PARTICULIER_VARIABLE_FIELDS = [
  "receiptNumber",
  "donorLastName",
  "donorFirstName",
  "donorAddress",
  "donorPostalCode",
  "donorCity",
  "donationAmount",
  "donationAmountInWords",
  "donationPaidAt",
  "taxArticle",
  "donationForm",
  "donationNature",
  "paymentMethod",
  "receiptIssuedAt",
] as const;

const CERFA_ENTREPRISE_TEMPLATE_PATH = path.join(
  process.cwd(),
  "assets",
  "cerfa",
  "cerfa-entreprise-torat-yaacov.pdf",
);

const CERFA_PARTICULIER_TEMPLATE_PATH = path.join(
  process.cwd(),
  "assets",
  "cerfa",
  "cerfa-particulier-torat-yaacov.pdf",
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
    paymentMethod: metadataText(metadata, "paymentMethod"),
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
      .replace(/\s/g, " ")}\u20ac`;
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

function drawAmountBox(page: import("pdf-lib").PDFPage, x: number, y: number) {
  page.drawRectangle({
    x,
    y,
    width: 72,
    height: 24,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.7,
  });
}

function cleanPdfText(value: string | null | undefined, fallback = "-") {
  const text = value?.trim();

  return text || fallback;
}

function drawTextFit(
  page: import("pdf-lib").PDFPage,
  text: string,
  options: {
    x: number;
    y: number;
    maxWidth: number;
    size: number;
    minSize?: number;
    font: import("pdf-lib").PDFFont;
    color: import("pdf-lib").RGB;
  },
) {
  let size = options.size;
  const minSize = options.minSize ?? 6.5;

  while (size > minSize && options.font.widthOfTextAtSize(text, size) > options.maxWidth) {
    size -= 0.25;
  }

  page.drawText(text, {
    x: options.x,
    y: options.y,
    size,
    font: options.font,
    color: options.color,
  });
}

function paymentMethodForDonation(
  donation: Donation,
  explicitMethod: string | null,
): "cash" | "check" | "bank_card" | "online" | null {
  if (explicitMethod) {
    const normalized = explicitMethod
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (normalized.includes("espece") || normalized.includes("cash")) return "cash";
    if (normalized.includes("cheque") || normalized.includes("check")) return "check";
    if (
      normalized.includes("virement") ||
      normalized.includes("prelevement") ||
      normalized.includes("cb") ||
      normalized.includes("carte")
    ) {
      return "bank_card";
    }
    if (normalized.includes("ligne") || normalized.includes("online")) return "online";
  }

  if (donation.source === DonationSource.ADMIN_CASH) return "cash";
  if (donation.source === DonationSource.ADMIN_CHECK) return "check";
  if (donation.source === DonationSource.ADMIN_BANK_TRANSFER) return "bank_card";
  if (donation.source === DonationSource.ONLINE) return "online";

  return null;
}

function drawPaymentMethodMark(
  page: import("pdf-lib").PDFPage,
  method: ReturnType<typeof paymentMethodForDonation>,
  font: import("pdf-lib").PDFFont,
  color: import("pdf-lib").RGB,
) {
  const positions = {
    cash: { x: 59.5, y: 314.7 },
    check: { x: 178.6, y: 314.7 },
    bank_card: { x: 297.7, y: 314.7 },
    online: { x: 416.8, y: 314.7 },
  };
  const size = 8.4;

  for (const position of Object.values(positions)) {
    page.drawRectangle({
      x: position.x,
      y: position.y,
      width: size,
      height: size,
      color: rgb(1, 1, 1),
      borderColor: color,
      borderWidth: 0.7,
    });
  }

  if (!method) return;

  const position = positions[method];

  page.drawText("X", {
    x: position.x + 1.2,
    y: position.y + 0.8,
    size: 8,
    font,
    color,
  });
}

function drawCheckboxGroupMark(
  page: import("pdf-lib").PDFPage,
  positions: Record<string, { x: number; y: number }>,
  selected: string | null,
  font: import("pdf-lib").PDFFont,
  color: import("pdf-lib").RGB,
) {
  if (!selected) return;

  const position = positions[selected];
  if (!position) return;

  page.drawText("X", {
    x: position.x + 1.2,
    y: position.y + 0.8,
    size: 8,
    font,
    color,
  });
}

function donorNames(donation: Donation, receipt: Receipt) {
  if (donation.donorFirstName || donation.donorLastName) {
    return {
      firstName: cleanPdfText(donation.donorFirstName, ""),
      lastName: cleanPdfText(donation.donorLastName, ""),
    };
  }

  const parts = receipt.donorName.trim().split(/\s+/);

  if (parts.length <= 1) {
    return { firstName: "", lastName: receipt.donorName };
  }

  return {
    firstName: parts.slice(1).join(" "),
    lastName: parts[0] ?? "",
  };
}

async function renderEntrepriseCerfaReceiptPdf({
  donation,
  receipt,
}: {
  donation: Donation;
  receipt: Receipt;
}) {
  const meta = receiptMetadata(donation);
  const paidAt = donation.paidAt ?? donation.createdAt;
  const template = await readFile(CERFA_ENTREPRISE_TEMPLATE_PATH);
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

  whiteout(page, 59, 468, 476, 77);
  page.drawText("Dénomination de l’entreprise : ", {
    x: 59.5,
    y: 534,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  drawTextFit(page, cleanPdfText(receipt.donorName || donation.donorEmail), {
    x: 191,
    y: 534,
    maxWidth: 320,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("Forme juridique : ", {
    x: 59.5,
    y: 523,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  drawTextFit(page, cleanPdfText(meta.companyLegalForm), {
    x: 130,
    y: 523,
    maxWidth: 386,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("N\u00b0 SIREN : ", {
    x: 59.5,
    y: 512,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  drawTextFit(page, cleanPdfText(receipt.donorTaxId), {
    x: 111,
    y: 512,
    maxWidth: 404,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("Adresse : ", {
    x: 59.5,
    y: 490,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  drawTextFit(page, cleanPdfText(receipt.donorAddress), {
    x: 102,
    y: 490,
    maxWidth: 416,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("Code Postal : ", {
    x: 59.5,
    y: 475.6,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  drawTextFit(page, cleanPdfText(receipt.donorZip), {
    x: 121,
    y: 475.6,
    maxWidth: 165,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("Commune : ", {
    x: 297,
    y: 475.6,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  drawTextFit(page, cleanPdfText(receipt.donorCity), {
    x: 349,
    y: 475.6,
    maxWidth: 164,
    size: 8.75,
    font: bold,
    color: textColor,
  });

  whiteout(page, 58, 358, 477, 70);
  drawAmountBox(page, 260, 402);
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

  drawPaymentMethodMark(
    page,
    paymentMethodForDonation(donation, meta.paymentMethod),
    bold,
    textColor,
  );

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

async function renderParticulierCerfaReceiptPdf({
  donation,
  receipt,
}: {
  donation: Donation;
  receipt: Receipt;
}) {
  const meta = receiptMetadata(donation);
  const paidAt = donation.paidAt ?? donation.createdAt;
  const template = await readFile(CERFA_PARTICULIER_TEMPLATE_PATH);
  const pdf = await PDFDocument.load(template);
  const page = pdf.getPage(0);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const textColor = rgb(0, 0, 0);
  const names = donorNames(donation, receipt);

  whiteout(page, 438, 774, 56, 12);
  page.drawText(receipt.number, {
    x: 439,
    y: 779,
    size: 8.75,
    font: bold,
    color: textColor,
  });

  whiteout(page, 59, 553, 476, 45);
  page.drawText("Nom : ", {
    x: 59.5,
    y: 582,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  drawTextFit(page, cleanPdfText(names.lastName), {
    x: 88,
    y: 582,
    maxWidth: 185,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("Pr\u00e9nom : ", {
    x: 297,
    y: 582,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  drawTextFit(page, cleanPdfText(names.firstName), {
    x: 340,
    y: 582,
    maxWidth: 176,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("Adresse : ", {
    x: 59.5,
    y: 569.2,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  drawTextFit(page, cleanPdfText(receipt.donorAddress), {
    x: 102,
    y: 569.2,
    maxWidth: 416,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("Code Postal : ", {
    x: 59.5,
    y: 554.9,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  drawTextFit(page, cleanPdfText(receipt.donorZip), {
    x: 121,
    y: 554.9,
    maxWidth: 165,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  page.drawText("Commune : ", {
    x: 297,
    y: 554.9,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  drawTextFit(page, cleanPdfText(receipt.donorCity), {
    x: 349,
    y: 554.9,
    maxWidth: 164,
    size: 8.75,
    font: bold,
    color: textColor,
  });

  whiteout(page, 58, 447, 477, 76);
  drawAmountBox(page, 260, 491);
  page.drawText(moneyLabel(donation.amountCents, donation.currency), {
    x: 282,
    y: 503,
    size: 12,
    font: regular,
    color: textColor,
  });
  page.drawText("Total des versements en toutes lettres : ", {
    x: 59.7,
    y: 473.9,
    size: 8.75,
    font: bold,
    color: textColor,
  });
  drawTextFit(page, amountInWords(donation.amountCents, donation.currency), {
    x: 222,
    y: 473.9,
    maxWidth: 300,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  page.drawText("Date du versement du don : ", {
    x: 59.7,
    y: 456.6,
    size: 8.75,
    font: regular,
    color: textColor,
  });
  page.drawText(frenchDate(paidAt), {
    x: 169,
    y: 456.6,
    size: 8.75,
    font: bold,
    color: textColor,
  });

  drawCheckboxGroupMark(
    page,
    {
      article200: { x: 59.5, y: 411.5 },
      article238bis: { x: 158.7, y: 411.5 },
      article885: { x: 277.8, y: 411.5 },
    },
    "article200",
    bold,
    textColor,
  );
  drawCheckboxGroupMark(
    page,
    {
      authenticAct: { x: 59.5, y: 359.9 },
      privateDeed: { x: 158.7, y: 359.9 },
      manualGiftDeclaration: { x: 277.8, y: 359.9 },
      other: { x: 426.6, y: 359.9 },
    },
    "manualGiftDeclaration",
    bold,
    textColor,
  );
  drawCheckboxGroupMark(
    page,
    {
      cashDonation: { x: 59.5, y: 308.4 },
      listedShares: { x: 158.7, y: 308.4 },
      other: { x: 277.8, y: 308.4 },
    },
    "cashDonation",
    bold,
    textColor,
  );
  drawCheckboxGroupMark(
    page,
    {
      cash: { x: 59.5, y: 256.8 },
      check: { x: 158.7, y: 256.8 },
      bank_card: { x: 277.8, y: 256.8 },
      online: { x: 426.6, y: 256.8 },
    },
    paymentMethodForDonation(donation, meta.paymentMethod),
    bold,
    textColor,
  );

  whiteout(page, 416, 156, 92, 16);
  page.drawText(frenchDate(receipt.issuedAt), {
    x: 416,
    y: 159.3,
    size: 7.5,
    font: bold,
    color: textColor,
  });

  return Buffer.from(await pdf.save());
}

export async function renderCerfaReceiptPdf({
  donation,
  receipt,
}: {
  donation: Donation;
  receipt: Receipt;
}) {
  if (receipt.type === CerfaReceiptType.ENTREPRISE) {
    return renderEntrepriseCerfaReceiptPdf({ donation, receipt });
  }

  return renderParticulierCerfaReceiptPdf({ donation, receipt });
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

    receipt = await prisma.$transaction(async (tx) => {
      return tx.receipt.create({
        data: {
          donationId: donation.id,
          number: await nextReceiptNumber(fiscalYear, tx),
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
    if (receipt.fileKey && receipt.fileKey !== uploaded.key) {
      await deleteFileFromS3(receipt.fileKey);
    }
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
