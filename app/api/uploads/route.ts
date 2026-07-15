import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/session";
import { uploadFilesToS3 } from "@/lib/uploads";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (
    !user ||
    (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)
  ) {
    return NextResponse.json({ ok: false, message: "Non autorise." }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Aucun fichier." },
      { status: 400 },
    );
  }

  try {
    const uploaded = await uploadFilesToS3(files, "events/uploads");
    return NextResponse.json({ ok: true, keys: uploaded.map((f) => f.key) });
  } catch (error) {
    console.error("[uploads] failed", error);
    return NextResponse.json(
      { ok: false, message: "Upload échoué." },
      { status: 500 },
    );
  }
}
