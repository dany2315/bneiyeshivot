import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { countDonationsForEmail } from "@/lib/donor-access";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    audience?: "bahour" | "admin";
    email?: string;
    mode?: "login" | "register";
  };
  const email = body.email?.trim().toLowerCase();

  if (!email || !body.audience) {
    return NextResponse.json(
      {
        allowed: false,
        message: "Email invalide.",
      },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      role: true,
    },
  });
  const isAdmin =
    user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  const donationCount = !user
    ? await countDonationsForEmail(email)
    : 0;

  if (
    body.audience === "bahour" &&
    !user &&
    donationCount === 0 &&
    body.mode !== "register"
  ) {
    return NextResponse.json(
      {
        allowed: false,
        reason: "register-required",
        message: "Aucun espace Bahour n'existe avec cet email. Inscris-toi d'abord.",
      },
      { status: 404 },
    );
  }

  if (body.audience === "bahour" && isAdmin) {
    return NextResponse.json(
      {
        allowed: false,
        reason: "admin-account",
        message:
          "Ce compte est administrateur. Connecte-toi depuis l'espace admin.",
      },
      { status: 403 },
    );
  }

  if (body.audience === "admin" && !isAdmin) {
    return NextResponse.json(
      {
        allowed: false,
        reason: "admin-required",
        message: "Ce compte n'a pas les droits administrateur.",
      },
      { status: 403 },
    );
  }

  return NextResponse.json({
    allowed: true,
  });
}
