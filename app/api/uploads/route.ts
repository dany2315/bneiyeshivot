import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/session";
import { deleteFileFromS3, uploadFilesToS3 } from "@/lib/uploads";

const allowedPrefixes = new Set([
  "events/uploads",
  "home/gallery",
  "store/products",
]);

function isAdmin(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  return (
    user &&
    (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN)
  );
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!isAdmin(user)) {
    return NextResponse.json({ ok: false, message: "Non autorise." }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);
  const requestedPrefix = String(formData.get("prefix") ?? "").trim();
  const prefix = allowedPrefixes.has(requestedPrefix)
    ? requestedPrefix
    : "events/uploads";

  if (files.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Aucun fichier." },
      { status: 400 },
    );
  }

  try {
    const uploaded = await uploadFilesToS3(files, prefix);
    return NextResponse.json({
      ok: true,
      files: uploaded,
      keys: uploaded.map((f) => f.key),
    });
  } catch (error) {
    console.error("[uploads] failed", error);
    return NextResponse.json(
      { ok: false, message: "Upload echoue." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();

  if (!isAdmin(user)) {
    return NextResponse.json({ ok: false, message: "Non autorise." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { key?: string } | null;
  const key = body?.key?.trim();

  if (!key || !key.startsWith("home/gallery/")) {
    return NextResponse.json(
      { ok: false, message: "Media galerie invalide." },
      { status: 400 },
    );
  }

  await deleteFileFromS3(key);
  return NextResponse.json({ ok: true });
}
