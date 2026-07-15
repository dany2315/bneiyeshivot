import { NextResponse } from "next/server";
import { z } from "zod";
import { createPresignedUploadUrl, createS3Key } from "@/lib/uploads";

const fileSchema = z.object({
  fieldName: z.string().min(1),
  label: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().optional().default("application/octet-stream"),
  size: z.number().int().positive(),
});

const bodySchema = z.object({
  kind: z.enum(["visa", "koupat"]),
  files: z.array(fileSchema).min(1),
});

const maxFileSize = 20 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());

    const uploads = await Promise.all(
      body.files.map(async (file) => {
        if (file.size > maxFileSize) {
          throw new Error(`Fichier trop lourd: ${file.fileName}`);
        }

        const mimeType = file.mimeType || "application/octet-stream";
        const key = createS3Key(
          `requests/${body.kind}/${file.fieldName}`,
          file.fileName,
        );

        return {
          fieldName: file.fieldName,
          label: file.label,
          fileKey: key,
          mimeType,
          uploadUrl: await createPresignedUploadUrl({ key, contentType: mimeType }),
        };
      }),
    );

    return NextResponse.json({ ok: true, uploads });
  } catch (error) {
    console.error("[requests/upload-url] failed", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Impossible de preparer l'upload des documents.",
      },
      { status: 400 },
    );
  }
}
