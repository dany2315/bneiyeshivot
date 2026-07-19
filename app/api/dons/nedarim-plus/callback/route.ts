import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import {
  NEDARIM_CALLBACK_IPS,
  markNedarimDonationFromResponse,
} from "@/lib/nedarim-plus";

function requestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    ""
  );
}

function callbackObject(formData: FormData) {
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
  );
}

export async function POST(request: Request) {
  const ip = requestIp(request);

  if (
    process.env.NEDARIM_PLUS_VERIFY_CALLBACK_IP !== "false" &&
    !NEDARIM_CALLBACK_IPS.includes(ip)
  ) {
    return NextResponse.json({ error: "IP callback invalide." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") || "";
  const response = contentType.includes("application/json")
    ? ((await request.json().catch(() => ({}))) as Record<string, unknown>)
    : callbackObject(await request.formData());
  const donationId =
    typeof response.Param1 === "string"
      ? response.Param1
      : typeof response.donationId === "string"
        ? response.donationId
        : "";

  if (!donationId) {
    return NextResponse.json({ error: "Param1 donationId manquant." }, { status: 400 });
  }

  const isError =
    response.Status === "Error" ||
    response.Status === "FAILED" ||
    response.Status === "Failed";

  await markNedarimDonationFromResponse({
    donationId,
    response,
    status: isError ? PaymentStatus.FAILED : PaymentStatus.PAID,
  });

  return NextResponse.json({ ok: true });
}
