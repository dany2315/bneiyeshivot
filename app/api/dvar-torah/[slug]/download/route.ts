import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const files: Record<string, string> = {
  "chabbat-berechit": "Dvar Torah - Chabbat Berechit",
  "hanouka-lumiere": "Dvar Torah - Hanouka",
  "pessah-liberte": "Dvar Torah - Pessah",
};

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function createPdf(title: string) {
  const lines = [
    title,
    "",
    "Feuillet Bnei Yeshivot",
    "Contenu de demonstration.",
    "",
    "Les fichiers reels seront ajoutes depuis l'interface admin.",
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
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const dbFile = await prisma.dvarTorahFile.findUnique({
    where: { slug },
  });

  if (dbFile?.published) {
    return NextResponse.redirect(dbFile.fileUrl);
  }

  const title = files[slug];

  if (!title) {
    return NextResponse.json({ message: "Fichier introuvable." }, { status: 404 });
  }

  return new NextResponse(createPdf(title), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${slug}.pdf"`,
    },
  });
}
