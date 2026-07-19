import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { markNedarimDonationFromResponse } from "@/lib/nedarim-plus";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    donationId?: string;
    response?: Record<string, unknown>;
  } | null;

  if (!payload?.donationId || !payload.response) {
    return NextResponse.json({ error: "Confirmation invalide." }, { status: 400 });
  }

  const isError =
    payload.response.Status === "Error" ||
    payload.response.Status === "FAILED" ||
    payload.response.Status === "Failed";

  await markNedarimDonationFromResponse({
    donationId: payload.donationId,
    response: payload.response,
    status: isError ? PaymentStatus.FAILED : PaymentStatus.PAID,
  });

  return NextResponse.json({ ok: true });
}
