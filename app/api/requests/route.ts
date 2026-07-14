import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createServiceRequest } from "@/lib/service-requests";
import { normalizeRequestInput } from "@/lib/request-validation";
import { uploadFileToS3 } from "@/lib/uploads";
import {
  newRequestAdminEmail,
  requestConfirmationEmail,
  sendEmail,
} from "@/lib/email";

const documentFields = [
  ["passportFile", "Photo du passeport non israelien"],
  ["formFile", "Formulaire rempli"],
  ["birthCertificateFile", "Acte de naissance"],
  ["studentCertificateFile", "Certificat d'etudiant ou Massa"],
  ["identityFile", "Document d'identite / visa"],
] as const;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const formData = contentType.includes("multipart/form-data")
      ? await request.formData()
      : null;
    const body = formData
      ? Object.fromEntries(
          Array.from(formData.entries()).filter(([, value]) => !(value instanceof File)),
        )
      : await request.json();
    normalizeRequestInput(body);

    const kind = String(body.kind ?? "");
    let uploadedDocuments: Array<{
      label: string;
      fileKey: string;
      mimeType: string;
    }> = [];

    try {
      uploadedDocuments = formData
        ? (
            await Promise.all(
              documentFields.map(async ([fieldName, label]) => {
                const file = formData.get(fieldName);

                if (!(file instanceof File) || file.size === 0) {
                  return null;
                }

                const uploaded = await uploadFileToS3(
                  file,
                  `requests/${kind || "general"}/${fieldName}`,
                );

                if (!uploaded) {
                  return null;
                }

                return {
                  label,
                  fileKey: uploaded.key,
                  mimeType: uploaded.mimeType,
                };
              }),
            )
          ).filter((document): document is NonNullable<typeof document> => Boolean(document))
        : [];
    } catch (error) {
      console.error("[requests] upload failed", error);
      return NextResponse.json(
        {
          ok: false,
          message:
            "Upload des documents impossible. Verifiez la configuration AWS S3 puis reessayez.",
        },
        { status: 503 },
      );
    }
    const serviceRequest = await createServiceRequest(body, uploadedDocuments);

    const email = typeof body.email === "string" ? body.email : "";
    const firstName = typeof body.firstName === "string" ? body.firstName : "";
    const lastName = typeof body.lastName === "string" ? body.lastName : "";
    const phone = typeof body.phone === "string" ? body.phone : undefined;
    const fullName = `${firstName} ${lastName}`.trim() || email || "Sans nom";
    const typeLabel =
      kind === "visa"
        ? "visa etudiant"
        : kind === "koupat"
          ? "koupat holim"
          : "demande";

    // Confirmation au demandeur (on n'echoue pas la demande si l'email ne part pas).
    if (email) {
      await sendEmail({
        to: email,
        ...requestConfirmationEmail({
          firstName: firstName || undefined,
          typeLabel,
        }),
      });
    }

    // Notification a l'equipe, avec lien direct vers la demande dans l'admin.
    const adminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL || "contact@bneiyeshivot.com";
    const adminPath =
      kind === "koupat" ? "koupat-holim" : kind === "visa" ? "visa" : "contact";
    const link = `${new URL(request.url).origin}/admin/${adminPath}#request-${serviceRequest.id}`;
    await sendEmail({
      to: adminEmail,
      ...newRequestAdminEmail({ typeLabel, fullName, email, phone, link }),
    });

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
        message: "Impossible de creer la demande pour le moment.",
      },
      { status: 500 },
    );
  }
}
