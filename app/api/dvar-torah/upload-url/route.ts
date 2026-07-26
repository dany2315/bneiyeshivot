import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import {
  createPresignedUploadUrl,
  createS3Key,
  publicUrlForKey,
} from "@/lib/uploads";

const maxFileSize = 25 * 1024 * 1024;

const bodySchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().optional().default("application/pdf"),
  size: z.number().int().positive().max(maxFileSize, "Le fichier PDF ne doit pas dépasser 25 Mo."),
});

function isAdmin(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  return (
    user &&
    (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN)
  );
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!isAdmin(user)) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await request.json());
    const mimeType = body.mimeType || "application/pdf";

    if (mimeType !== "application/pdf") {
      return NextResponse.json(
        { ok: false, message: "Seuls les fichiers PDF sont acceptés." },
        { status: 400 },
      );
    }

    const key = createS3Key("dvar-torah", body.fileName);

    return NextResponse.json({
      ok: true,
      file: {
        key,
        url: publicUrlForKey(key),
        mimeType,
        size: body.size,
        uploadUrl: await createPresignedUploadUrl({ key, contentType: mimeType }),
      },
    });
  } catch (error) {
    console.error("[dvar-torah/upload-url] failed", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Impossible de préparer l’upload du PDF.",
      },
      { status: 400 },
    );
  }
}
