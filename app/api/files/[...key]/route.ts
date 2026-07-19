import { NextResponse } from "next/server";
import { getFileFromS3 } from "@/lib/uploads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const fileKey = key.map((part) => decodeURIComponent(part)).join("/");

  // Securite : seuls les medias publics du site, les medias d'evenement
  // et les images produit boutique sont servis publiquement.
  // Les documents de dossier (passeports, etc.) ont leurs propres routes protegees.
  if (
    !fileKey.startsWith("events/") &&
    !fileKey.startsWith("public/") &&
    !fileKey.startsWith("store/products/")
  ) {
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
