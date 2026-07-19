import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/session";
import { deleteStoreProductImageFromS3 } from "@/lib/uploads";

export async function DELETE(request: Request) {
  const user = await getCurrentUser();

  if (
    !user ||
    (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)
  ) {
    return NextResponse.json({ ok: false, message: "Non autorise." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { key?: string } | null;
  const key = body?.key?.trim();

  if (!key) {
    return NextResponse.json(
      { ok: false, message: "Image introuvable." },
      { status: 400 },
    );
  }

  try {
    await deleteStoreProductImageFromS3(key);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[store-product-image] delete failed", error);
    return NextResponse.json(
      { ok: false, message: "Suppression image echouee." },
      { status: 500 },
    );
  }
}
