import { NextResponse } from "next/server";
import JSZip from "jszip";
import { renderCerfaReceiptPdf } from "@/lib/cerfa";
import { formatMoney } from "@/lib/donations";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

function csvCell(value: unknown) {
  const text = String(value ?? "");

  return `"${text.replaceAll('"', '""')}"`;
}

function readDate(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);

  if (!value) return null;

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

async function getReceipts(from: Date | null, to: Date | null) {
  const issuedAt =
    from || to
      ? {
          gte: from ?? undefined,
          lt: to ? new Date(to.getTime() + 24 * 60 * 60 * 1000) : undefined,
        }
      : undefined;

  return prisma.receipt.findMany({
    where: { issuedAt },
    include: { donation: true },
    orderBy: { issuedAt: "asc" },
  });
}

export async function GET(request: Request) {
  await requireAdminUser();

  const url = new URL(request.url);
  const from = readDate(url.searchParams, "from");
  const to = readDate(url.searchParams, "to");
  const receipts = await getReceipts(from, to);
  const zip = new JSZip();

  const indexRows = [
    [
      "numéro",
      "date_émission",
      "année_fiscale",
      "donateur",
      "email",
      "montant",
      "devise",
      "don_id",
    ],
    ...receipts.map((receipt) => [
      receipt.number,
      receipt.issuedAt.toISOString(),
      receipt.fiscalYear,
      receipt.donorName,
      receipt.donation.donorEmail,
      formatMoney(receipt.donation.amountCents, receipt.donation.currency),
      receipt.donation.currency,
      receipt.donationId,
    ]),
  ];

  zip.file("index-recus.csv", indexRows.map((row) => row.map(csvCell).join(",")).join("\n"));

  for (const receipt of receipts) {
    const safeNumber = receipt.number.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const pdf = await renderCerfaReceiptPdf({
      donation: receipt.donation,
      receipt,
    });
    zip.file(`recus/${safeNumber}.pdf`, pdf);
  }

  const archive = await zip.generateAsync({ type: "uint8array" });
  const archiveBody = archive.buffer.slice(
    archive.byteOffset,
    archive.byteOffset + archive.byteLength,
  ) as ArrayBuffer;
  const suffix =
    from || to
      ? `${url.searchParams.get("from") ?? "debut"}_${url.searchParams.get("to") ?? "fin"}`
      : "tous";

  return new NextResponse(archiveBody, {
    headers: {
      "Content-Disposition": `attachment; filename="recus-cerfa-${suffix}.zip"`,
      "Content-Type": "application/zip",
    },
  });
}
