import { NextResponse } from "next/server";
import JSZip from "jszip";
import type { Prisma } from "@prisma/client";
import { renderCerfaReceiptPdf } from "@/lib/cerfa";
import { formatMoney } from "@/lib/donations";
import { isAdminRole } from "@/lib/donor-access";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

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

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user || isAdminRole(user.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const url = new URL(request.url);
  const from = readDate(url.searchParams, "from");
  const to = readDate(url.searchParams, "to");
  const type = url.searchParams.get("type") === "facture" ? "facture" : "cerfa";
  const issuedAt =
    from || to
      ? {
          gte: from ?? undefined,
          lt: to ? new Date(to.getTime() + 24 * 60 * 60 * 1000) : undefined,
        }
      : undefined;
  const donationOwnerWhere: Prisma.DonationWhereInput = {
    OR: [
      { donorEmail: user.email },
      { userId: user.id },
      {
        metadata: {
          path: ["receiptEmail"],
          equals: user.email,
        },
      },
    ],
  };
  const zip = new JSZip();

  if (type === "facture") {
    const donations = await prisma.donation.findMany({
      where: {
        AND: [
          donationOwnerWhere,
          issuedAt
            ? {
                OR: [
                  { paidAt: issuedAt },
                  { paidAt: null, createdAt: issuedAt },
                ],
              }
            : {},
        ],
      },
      orderBy: { paidAt: "asc" },
    });
    const rows = [
      ["date_don", "donateur", "montant", "devise", "don_id", "recu_paiement"],
      ...donations.map((donation) => {
        const metadata =
          donation.metadata &&
          typeof donation.metadata === "object" &&
          !Array.isArray(donation.metadata)
            ? (donation.metadata as Record<string, unknown>)
            : {};
        return [
          (donation.paidAt ?? donation.createdAt).toISOString(),
          donation.donorName ?? donation.donorEmail,
          formatMoney(donation.amountCents, donation.currency),
          donation.currency,
          donation.id,
          typeof metadata.stripeReceiptUrl === "string"
            ? metadata.stripeReceiptUrl
            : "",
        ];
      }),
    ];

    zip.file(
      "factures.csv",
      rows.map((row) => row.map(csvCell).join(",")).join("\n"),
    );

    const archive = await zip.generateAsync({ type: "uint8array" });
    const archiveBody = archive.buffer.slice(
      archive.byteOffset,
      archive.byteOffset + archive.byteLength,
    ) as ArrayBuffer;

    return new NextResponse(archiveBody, {
      headers: {
        "Content-Disposition": `attachment; filename="mes-factures.zip"`,
        "Content-Type": "application/zip",
      },
    });
  }

  const receipts = await prisma.receipt.findMany({
    where: {
      issuedAt,
      donation: donationOwnerWhere,
    },
    include: { donation: true },
    orderBy: { issuedAt: "asc" },
  });
  const indexRows = [
    ["numero", "date_emission", "donateur", "montant", "devise", "don_id"],
    ...receipts.map((receipt) => [
      receipt.number,
      receipt.issuedAt.toISOString(),
      receipt.donorName,
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

  return new NextResponse(archiveBody, {
    headers: {
      "Content-Disposition": `attachment; filename="mes-recus-cerfa.zip"`,
      "Content-Type": "application/zip",
    },
  });
}
