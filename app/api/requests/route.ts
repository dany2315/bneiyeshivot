import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createServiceRequest } from "@/lib/service-requests";
import { uploadFileToS3 } from "@/lib/uploads";
import { requestConfirmationEmail, sendEmail } from "@/lib/email";

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
    const kind = String(body.kind ?? "");
    const uploadedDocuments = formData
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
    const serviceRequest = await createServiceRequest(body, uploadedDocuments);

    const email = typeof body.email === "string" ? body.email : "";
    if (email) {
      const typeLabel =
        kind === "visa"
          ? "visa etudiant"
          : kind === "koupat"
            ? "koupat holim"
            : "demande";
      const template = requestConfirmationEmail({
        firstName:
          typeof body.firstName === "string" ? body.firstName : undefined,
        typeLabel,
      });
      // On n'echoue pas la demande si l'email ne part pas.
      await sendEmail({ to: email, ...template });
    }

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
