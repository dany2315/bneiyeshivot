import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFileFromS3 } from "@/lib/uploads";

const guideS3Key = process.env.GUIDE_PDF_S3_KEY || "guides/guide-yeshiva-2026.pdf";

async function pdfResponse() {
  try {
    const guide = await getFileFromS3(guideS3Key);

    return new NextResponse(guide.body, {
      headers: {
        "Content-Type": guide.contentType || "application/pdf",
        "Content-Disposition": 'attachment; filename="guide-yeshiva-2026.pdf"',
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Le guide est momentanément indisponible." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Connexion requise." }, { status: 401 });
  }

  return pdfResponse();
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

  return pdfResponse();
}
