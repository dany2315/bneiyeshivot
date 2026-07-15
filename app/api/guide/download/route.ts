import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function createGuidePdf(name: string) {
  const lines = [
    "Guide Bnei Yeshivot",
    name ? `Prepare pour ${name}` : "Guide pratique",
    "",
    "Bienvenue en Israel.",
    "Ce guide regroupe les premiers reperes pour preparer votre arrivee :",
    "- Documents administratifs",
    "- Assurance maladie",
    "- Visa etudiant",
    "- Installation, banque, telephone et transport",
    "- Contacts utiles Bnei Yeshivot",
    "",
    "Version complete a enrichir depuis l'interface admin.",
  ];

  const text = lines
    .map((line, index) => `1 0 0 1 72 ${760 - index * 24} Tm (${escapePdfText(line)}) Tj`)
    .join("\n");
  const stream = `BT\n/F1 14 Tf\n${text}\nET`;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream\nendobj\n`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += object;
  }

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf);
}

function pdfResponse(name = "") {
  return new NextResponse(createGuidePdf(name), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="guide-bnei-yeshivot.pdf"',
    },
  });
}

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Connexion requise." }, { status: 401 });
  }

  return pdfResponse(session.user.name ?? session.user.email);
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

  return pdfResponse(`${firstName} ${lastName}`);
}
