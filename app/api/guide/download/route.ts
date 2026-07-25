import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPresignedDownloadUrl } from "@/lib/uploads";

const guideS3Key = process.env.GUIDE_PDF_S3_KEY || "guides/guide-yeshiva-2026.pdf";
const guideFileName = "guide-yeshiva-2026.pdf";

async function guideDownloadUrl() {
  return createPresignedDownloadUrl({
    key: guideS3Key,
    contentType: "application/pdf",
    fileName: guideFileName,
  });
}

async function guideUrlResponse() {
  try {
    return NextResponse.json({ downloadUrl: await guideDownloadUrl() });
  } catch (error) {
    console.error("[guide] URL de téléchargement indisponible", error);
    return NextResponse.json(
      { message: "Le guide est momentanément indisponible." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Connexion requise." }, { status: 401 });
  }

  try {
    const downloadUrl = await guideDownloadUrl();
    const { searchParams } = new URL(request.url);

    if (searchParams.get("format") === "json") {
      return NextResponse.json({ downloadUrl });
    }

    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error("[guide] redirection de téléchargement indisponible", error);
    return NextResponse.json(
      { message: "Le guide est momentanément indisponible." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const form = await request.formData();
  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const phone = String(form.get("phone") ?? "").trim();

  if (!firstName || !lastName || !email || !phone) {
    return NextResponse.json(
      { message: "Tous les champs sont obligatoires." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        phone,
      },
    });
  }

  return guideUrlResponse();
}
