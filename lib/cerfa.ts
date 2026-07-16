import PDFDocument from "pdfkit";
import type { Donation, Receipt } from "@prisma/client";
import { CerfaReceiptType, ReceiptStatus } from "@prisma/client";
import { nextReceiptNumber } from "@/lib/donations";
import { prisma } from "@/lib/prisma";
import { uploadBufferToS3 } from "@/lib/uploads";

type DonationWithReceipt = Donation & {
  receipt: Receipt | null;
};

const BENEFICIARY = {
  name: "Association Torat Yaacov",
  rna: "W932012476",
  address: "11 Bis avenue Joffre",
  zip: "93220",
  city: "Gagny",
  object:
    "L'association a pour but d'aider les etudiants en leur proposant des cours, des repas et des bourses.",
};

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

function receiptKindLabel(type: CerfaReceiptType) {
  if (type === CerfaReceiptType.ENTREPRISE) {
    return {
      title: "Recu des dons et versements effectues par les entreprises",
      subtitle: "au titre de l'article 238 bis du code general des impots",
      cerfa: "Cerfa n° 16216*03 - Formulaire 2041-MEC-SD",
    };
  }

  return {
    title: "Recu des dons et versements effectues par les particuliers",
    subtitle: "au titre des articles 200 et 978 du code general des impots",
    cerfa: "Cerfa n° 11580 - Formulaire 2041-RD",
  };
}

function paymentModeLabel(donation: Donation) {
  if (donation.provider === "STRIPE") {
    return "Virement, prelevement, CB ou paiement en ligne";
  }

  if (donation.source === "ADMIN_CASH") return "Remise d'especes";
  if (donation.source === "ADMIN_CHECK") return "Cheque";
  if (donation.source === "ADMIN_BANK_TRANSFER") return "Virement";

  return "Autre";
}

function cerfaMoney(amountCents: number, currency: string) {
  const amount = amountCents / 100;

  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  })
    .format(amount)
    .replace(/\s/g, " ")} ${currency}`;
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string, y: number) {
  doc
    .fillColor("#062846")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(title, 48, y);
  doc.moveTo(48, y + 18).lineTo(547, y + 18).strokeColor("#b8c4d2").stroke();
}

function drawField(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string | null | undefined,
) {
  doc.fillColor("#4d5d70").fontSize(8).font("Helvetica").text(label, x, y);
  doc.fillColor("#071b31").fontSize(10).font("Helvetica-Bold").text(value || "-", x, y + 13, {
    width,
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
  const receiptKind = receiptKindLabel(receipt.type);
  const paidAt = donation.paidAt ?? donation.createdAt;
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({
    size: "A4",
    margin: 42,
    info: {
      Title: `Recu fiscal ${receipt.number}`,
      Author: BENEFICIARY.name,
      Subject: "Recu fiscal de don",
    },
  });

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.rect(0, 0, 595, 92).fill("#f2f5f8");
  doc
    .fillColor("#071b31")
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(receiptKind.title, 48, 24, { width: 360 })
    .font("Helvetica")
    .fontSize(9)
    .text(receiptKind.subtitle, 48, 48, { width: 360 })
    .text(receiptKind.cerfa, 48, 64, { width: 360 });

  doc
    .fillColor("#071b31")
    .font("Helvetica")
    .fontSize(9)
    .text("Numero d'ordre du recu", 398, 24, { width: 145, align: "right" })
    .font("Helvetica-Bold")
    .fontSize(15)
    .text(receipt.number, 398, 40, { width: 145, align: "right" });

  drawSectionTitle(doc, "Organisme beneficiaire des versements", 118);
  drawField(doc, 48, 150, 330, "Denomination de l'organisme", BENEFICIARY.name);
  drawField(doc, 398, 150, 145, "N° RNA", BENEFICIARY.rna);
  drawField(doc, 48, 188, 330, "Adresse", BENEFICIARY.address);
  drawField(doc, 398, 188, 60, "Code postal", BENEFICIARY.zip);
  drawField(doc, 468, 188, 75, "Commune", BENEFICIARY.city);
  drawField(doc, 48, 226, 495, "Objet", BENEFICIARY.object);
  doc
    .fillColor("#4d5d70")
    .font("Helvetica")
    .fontSize(8)
    .text(
      "Oeuvre ou organisme d'interet general ayant un caractere philanthropique, educatif, scientifique, social, humanitaire, sportif, familial ou culturel.",
      48,
      264,
      { width: 495, lineGap: 2 },
    );

  drawSectionTitle(
    doc,
    receipt.type === CerfaReceiptType.ENTREPRISE
      ? "Entreprise donatrice"
      : "Donateur",
    310,
  );
  drawField(
    doc,
    48,
    342,
    330,
    receipt.type === CerfaReceiptType.ENTREPRISE
      ? "Denomination de l'entreprise"
      : "Nom et prenom",
    receipt.donorName,
  );
  if (receipt.type === CerfaReceiptType.ENTREPRISE) {
    drawField(doc, 398, 342, 70, "Forme juridique", meta.companyLegalForm);
    drawField(doc, 478, 342, 65, "N° SIREN", receipt.donorTaxId);
  }
  drawField(doc, 48, 382, 330, "Adresse", receipt.donorAddress);
  drawField(doc, 398, 382, 60, "Code postal", receipt.donorZip);
  drawField(doc, 468, 382, 75, "Commune", receipt.donorCity);
  if (receipt.type !== CerfaReceiptType.ENTREPRISE) {
    drawField(doc, 48, 422, 140, "Pays", receipt.donorCountry);
  }

  drawSectionTitle(doc, "Versement recu", 462);
  doc
    .fillColor("#071b31")
    .font("Helvetica")
    .fontSize(9)
    .text(
      receipt.type === CerfaReceiptType.ENTREPRISE
        ? "L'organisme beneficiaire reconnait avoir recu, au titre de la reduction d'impot prevue a l'article 238 bis du code general des impots, des versements pour une valeur totale egale a :"
        : "L'organisme beneficiaire reconnait avoir recu des dons et versements ouvrant droit a reduction d'impot pour une valeur totale egale a :",
      48,
      494,
      { width: 495, lineGap: 2 },
    );
  doc
    .fillColor("#062846")
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(cerfaMoney(donation.amountCents, donation.currency), 48, 542);
  drawField(
    doc,
    48,
    582,
    180,
    "Date du versement du don",
    paidAt.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  );
  drawField(doc, 250, 582, 210, "Forme du versement", paymentModeLabel(donation));

  doc
    .roundedRect(48, 640, 495, 96, 8)
    .lineWidth(1)
    .strokeColor("#b8c4d2")
    .stroke();
  doc
    .fillColor("#071b31")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Date et signature", 66, 660)
    .font("Helvetica")
    .fontSize(10)
    .text(
      receipt.issuedAt.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      66,
      684,
    )
    .font("Helvetica-Bold")
    .text(BENEFICIARY.name, 325, 684, { width: 180, align: "center" });

  doc
    .fillColor("#4d5d70")
    .font("Helvetica")
    .fontSize(7)
    .text(
      "Recu genere automatiquement et rattache au don confirme dans le back-office.",
      48,
      768,
      { width: 495, align: "center" },
    );

  doc.end();

  return done;
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
