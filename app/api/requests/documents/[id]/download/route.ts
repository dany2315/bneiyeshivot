import { NextResponse } from "next/server";
import { isAdminRole } from "@/lib/donor-access";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getFileFromS3 } from "@/lib/uploads";

function downloadName(document: { fileKey: string; label: string }) {
  const rawName = document.fileKey.split("/").pop() || document.label || "document";
  const withoutPrefix = rawName.replace(/^\d+-[a-f0-9-]+-/i, "");
  return withoutPrefix || `${document.label}.pdf`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Non autorise." }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.requestDocument.findUnique({
    where: { id },
    include: {
      request: {
        select: { userId: true },
      },
    },
  });

  if (!document) {
    return NextResponse.json({ message: "Introuvable." }, { status: 404 });
  }

  if (!isAdminRole(user.role) && document.request.userId !== user.id) {
    return NextResponse.json({ message: "Introuvable." }, { status: 404 });
  }

  try {
    const file = await getFileFromS3(document.fileKey);

    return new NextResponse(file.body, {
      headers: {
        "Content-Type": file.contentType || document.mimeType || "application/octet-stream",
        "Content-Disposition": `${
          new URL(request.url).searchParams.get("disposition") === "inline"
            ? "inline"
            : "attachment"
        }; filename="${downloadName(document)}"`,
        ...(file.contentLength
          ? { "Content-Length": String(file.contentLength) }
          : {}),
      },
    });
  } catch {
    return NextResponse.json({ message: "Introuvable." }, { status: 404 });
  }
}
