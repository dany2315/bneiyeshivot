import { NextResponse } from "next/server";
import { formatMoney } from "@/lib/donations";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

function csvCell(value: unknown) {
  const text = String(value ?? "");

  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  await requireAdminUser();

  const donations = await prisma.donation.findMany({
    include: { receipt: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    [
      "id",
      "date",
      "donateur",
      "email",
      "telephone",
      "montant",
      "devise",
      "statut",
      "frequence",
      "origine",
      "recu_statut",
      "recu_numero",
      "stripe_payment_intent",
    ],
    ...donations.map((donation) => [
      donation.id,
      donation.createdAt.toISOString(),
      donation.donorName ?? "",
      donation.donorEmail,
      donation.donorPhone ?? "",
      formatMoney(donation.amountCents, donation.currency),
      donation.currency,
      donation.status,
      donation.frequency,
      donation.source,
      donation.receiptStatus,
      donation.receipt?.number ?? "",
      donation.stripePaymentIntentId ?? "",
    ]),
  ];

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": 'attachment; filename="dons-bnei-yeshivot.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
