import PDFDocument from "pdfkit";
import type { Donation, Receipt } from "@prisma/client";
import { CerfaReceiptType, ReceiptStatus } from "@prisma/client";
import { formatMoney, nextReceiptNumber } from "@/lib/donations";
import { prisma } from "@/lib/prisma";
import { uploadBufferToS3 } from "@/lib/uploads";

type DonationWithReceipt = Donation & {
  receipt: Receipt | null;
};

function metadataObject(metadata: unknown) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {};
}

function receiptMetadata(donation: Donation) {
  const receipt = metadataObject(metadataObject(donation.metadata).receipt);

  return {
    type:
      typeof receipt.type === "string" &&
      Object.values(CerfaReceiptType).includes(receipt.type as CerfaReceiptType)
        ? (receipt.type as CerfaReceiptType)
        : CerfaReceiptType.PARTICULIER,
    address: typeof receipt.address === "string" ? receipt.address : null,
    zip: typeof receipt.zip === "string" ? receipt.zip : null,
    city: typeof receipt.city === "string" ? receipt.city : null,
    country: typeof receipt.country === "string" ? receipt.country : "France",
    taxId: typeof receipt.taxId === "string" ? receipt.taxId : null,
  };
}

function drawLine(doc: PDFKit.PDFDocument, y: number) {
  doc.moveTo(50, y).lineTo(545, y).strokeColor("#dfe7f0").stroke();
}

function drawBox(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  value: string,
) {
  doc
    .roundedRect(x, y, width, height, 8)
    .lineWidth(1)
    .strokeColor("#dfe7f0")
    .stroke();
  doc.fillColor("#637186").fontSize(8).text(title.toUpperCase(), x + 12, y + 10);
  doc.fillColor("#071b31").fontSize(13).text(value || "-", x + 12, y + 28, {
    width: width - 24,
  });
}

export async function renderCerfaReceiptPdf({
  donation,
  receipt,
}: {
  donation: Donation;
  receipt: Receipt;
}) {
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: `Recu fiscal ${receipt.number}`,
      Author: "Bnei Yeshivot",
      Subject: "Recu fiscal de don",
    },
  });

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc
    .rect(0, 0, 595, 120)
    .fill("#062846");
  doc
    .fillColor("#ffffff")
    .fontSize(24)
    .text("Bnei Yeshivot", 50, 36)
    .fontSize(11)
    .fillColor("#ffb35c")
    .text("France - Israel", 50, 66);
  doc
    .fillColor("#ffffff")
    .fontSize(16)
    .text("Recu fiscal de don", 345, 38, { width: 200, align: "right" })
    .fontSize(10)
    .text(receipt.number, 345, 64, { width: 200, align: "right" });

  doc.fillColor("#071b31").fontSize(18).text("Recu au titre des dons", 50, 150);
  doc
    .fillColor("#637186")
    .fontSize(10)
    .text(
      "Document genere automatiquement apres confirmation du paiement. Les informations ci-dessous sont rattachees au don dans le back-office Bnei Yeshivot.",
      50,
      178,
      { width: 495, lineGap: 3 },
    );
  drawLine(doc, 220);

  drawBox(doc, 50, 240, 155, 74, "Numero", receipt.number);
  drawBox(doc, 220, 240, 155, 74, "Date emission", receipt.issuedAt.toLocaleDateString("fr-FR"));
  drawBox(doc, 390, 240, 155, 74, "Annee fiscale", String(receipt.fiscalYear));

  doc.fillColor("#071b31").fontSize(15).text("Donateur", 50, 344);
  drawBox(doc, 50, 370, 240, 120, "Nom", receipt.donorName);
  drawBox(
    doc,
    305,
    370,
    240,
    120,
    "Adresse",
    [
      receipt.donorAddress,
      [receipt.donorZip, receipt.donorCity].filter(Boolean).join(" "),
      receipt.donorCountry,
      receipt.donorTaxId ? `ID fiscal: ${receipt.donorTaxId}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  doc.fillColor("#071b31").fontSize(15).text("Don", 50, 520);
  drawBox(doc, 50, 546, 155, 84, "Montant", formatMoney(donation.amountCents, donation.currency));
  drawBox(doc, 220, 546, 155, 84, "Mode", donation.source);
  drawBox(doc, 390, 546, 155, 84, "Paiement", donation.stripePaymentIntentId ?? donation.id);

  doc
    .fillColor("#637186")
    .fontSize(9)
    .text(
      "Ce recu est emis sur la base des informations fournies par le donateur et des donnees de paiement confirmees. Il doit etre conserve avec les justificatifs de paiement.",
      50,
      675,
      { width: 495, lineGap: 3 },
    );

  doc
    .fillColor("#062846")
    .fontSize(10)
    .text("Bnei Yeshivot - contact@bneiyeshivot.com", 50, 760, {
      width: 495,
      align: "center",
    });

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
    receipt = await prisma.receipt.create({
      data: {
        donationId: donation.id,
        number: await nextReceiptNumber(fiscalYear),
        type: meta.type,
        fiscalYear,
        donorName: donation.donorName || donation.donorEmail,
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
