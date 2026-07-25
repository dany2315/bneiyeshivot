import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UserAccountType } from "@prisma/client";
import { ZodError } from "zod";
import { createServiceRequest } from "@/lib/service-requests";
import { normalizeRequestInput } from "@/lib/request-validation";
import {
  newRequestAdminEmail,
  requestConfirmationEmail,
  sendEmail,
} from "@/lib/email";
import { getCurrentUser } from "@/lib/session";

type UploadedDocumentPayload = {
  label: string;
  fileKey: string;
  mimeType: string;
};

function isUploadedDocumentPayload(
  document: unknown,
): document is UploadedDocumentPayload {
  return (
    typeof document === "object" &&
    document !== null &&
    "label" in document &&
    "fileKey" in document &&
    "mimeType" in document &&
    typeof document.label === "string" &&
    typeof document.fileKey === "string" &&
    typeof document.mimeType === "string"
  );
}

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function requestBahourContext(body: Record<string, unknown>) {
  const fullName = [readText(body.firstName), readText(body.lastName)]
    .filter(Boolean)
    .join(" ");

  return {
    fullName,
    email: readText(body.email),
    phone: readText(body.phone),
    school: readText(body.school),
  };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const formData = contentType.includes("multipart/form-data")
      ? await request.formData()
      : null;
    const body: Record<string, unknown> = formData
      ? (Object.fromEntries(
          Array.from(formData.entries()).filter(([, value]) => !(value instanceof File)),
        ) as Record<string, unknown>)
      : await request.json();
    normalizeRequestInput(body);

    const kind = String(body.kind ?? "");
    const uploadedDocuments = Array.isArray(body.documents)
      ? body.documents
          .filter(isUploadedDocumentPayload)
          .map((document) => ({
            label: document.label,
            fileKey: document.fileKey,
            mimeType: document.mimeType,
          }))
      : [];
    const currentUser = await getCurrentUser();
    const serviceRequest = await createServiceRequest(body, uploadedDocuments, {
      actorUserId: currentUser?.id,
    });

    const email = readText(body.email);
    const firstName = readText(body.firstName);
    const lastName = readText(body.lastName);
    const phone = readText(body.phone) || undefined;
    const fullName = `${firstName} ${lastName}`.trim() || email || "Sans nom";
    const bahourContext =
      currentUser?.accountType === UserAccountType.YESHIVA
        ? requestBahourContext(body)
        : undefined;
    const typeLabel =
      kind === "visa"
        ? "visa étudiant"
        : kind === "koupat"
          ? "koupat holim"
          : "demande";

    // Confirmation au demandeur (on n'echoue pas la demande si l'email ne part pas).
    if (email) {
      const confirmationEmail = await requestConfirmationEmail({
        bahourContext,
        firstName: firstName || undefined,
        typeLabel,
      });

      await sendEmail({
        to: email,
        ...confirmationEmail,
      });
    }

    // Notification a l'equipe, avec lien direct vers la demande dans l'admin.
    const adminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL || "contact@bneiyeshivot.com";
    const adminPath =
      kind === "koupat" ? "koupat-holim" : kind === "visa" ? "visa" : "contact";
    const link = `${new URL(request.url).origin}/admin/${adminPath}#request-${serviceRequest.id}`;
    const notificationEmail = await newRequestAdminEmail({
      typeLabel,
      fullName,
      email,
      phone,
      link,
    });

    await sendEmail({
      to: adminEmail,
      ...notificationEmail,
    });

    if (kind === "visa") {
      revalidatePath("/admin/visa");
    }

    if (kind === "koupat") {
      revalidatePath("/admin/koupat-holim");
    }

    revalidatePath("/client");

    return NextResponse.json(
      {
        ok: true,
        requestId: serviceRequest.id,
        status: serviceRequest.status,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Certains champs sont incomplets.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    console.error("[requests] create failed", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Impossible de créer la demande pour le moment.",
      },
      { status: 500 },
    );
  }
}
