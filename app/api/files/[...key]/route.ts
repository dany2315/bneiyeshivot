import { NextResponse } from "next/server";
import { isAdminRole } from "@/lib/donor-access";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getFileFromS3 } from "@/lib/uploads";

function isPublicFile(fileKey: string) {
  return (
    fileKey.startsWith("events/") ||
    fileKey.startsWith("home/gallery/") ||
    fileKey.startsWith("public/") ||
    fileKey.startsWith("store/products/")
  );
}

async function canReadDonationReceipt(fileKey: string) {
  if (
    !fileKey.startsWith("donations/") ||
    !fileKey.includes("/receipts/")
  ) {
    return false;
  }

  const user = await getCurrentUser();

  if (!user) return false;
  if (isAdminRole(user.role)) return true;

  const receipt = await prisma.receipt.findFirst({
    where: {
      fileKey,
      donation: {
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
      },
    },
    select: { id: true },
  });

  return Boolean(receipt);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const fileKey = key.map((part) => decodeURIComponent(part)).join("/");

  // Securite : seuls les medias publics du site, les medias d'evenement
  // et les images produit boutique sont servis publiquement.
  // Les documents de dossier (passeports, etc.) ont leurs propres routes protegees.
  if (!isPublicFile(fileKey) && !(await canReadDonationReceipt(fileKey))) {
    return NextResponse.json({ message: "Introuvable." }, { status: 404 });
  }

  try {
    const file = await getFileFromS3(fileKey);
    return new NextResponse(file.body, {
      headers: {
        "Content-Type": file.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        ...(file.contentLength
          ? { "Content-Length": String(file.contentLength) }
          : {}),
      },
    });
  } catch {
    return NextResponse.json({ message: "Introuvable." }, { status: 404 });
  }
}
