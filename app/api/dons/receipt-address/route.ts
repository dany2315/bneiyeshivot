import { NextResponse } from "next/server";
import { PaymentProvider, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function metadataObject(metadata: unknown) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {};
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        address?: {
          city?: string | null;
          country?: string | null;
          line1?: string | null;
          line2?: string | null;
          postal_code?: string | null;
          state?: string | null;
        };
        donationId?: string;
        name?: string | null;
      }
    | null;

  const donationId = readString(body?.donationId);
  const address = body?.address;
  const line1 = readString(address?.line1);
  const line2 = readString(address?.line2);
  const city = readString(address?.city);
  const zip = readString(address?.postal_code);
  const country = readString(address?.country);

  if (!donationId || !line1 || !city || !zip || !country) {
    return NextResponse.json(
      { error: "Adresse fiscale complete obligatoire pour le recu Cerfa." },
      { status: 400 },
    );
  }

  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    select: {
      donorName: true,
      metadata: true,
      provider: true,
    },
  });

  if (!donation || donation.provider !== PaymentProvider.STRIPE) {
    return NextResponse.json({ error: "Don Stripe introuvable." }, { status: 404 });
  }

  const metadata = metadataObject(donation.metadata);
  const receipt = metadataObject(metadata.receipt);
  const state = readString(address?.state);
  const fiscalAddress = [line1, line2, state].filter(Boolean).join(" ");

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      donorName: readString(body?.name) || donation.donorName,
      metadata: {
        ...metadata,
        receipt: {
          ...receipt,
          address: fiscalAddress,
          city,
          country,
          zip,
        },
        receiptAddressCollectedAt: new Date().toISOString(),
      } as Prisma.InputJsonObject,
    },
  });

  return NextResponse.json({ ok: true });
}
