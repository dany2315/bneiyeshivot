import {
  Prisma,
  ServiceRequestType,
  type ServiceRequest,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  normalizeRequestInput,
  type ServiceRequestInput,
} from "@/lib/request-validation";

export type ServiceRequestDocumentInput = {
  label: string;
  fileKey: string;
  mimeType: string;
};

const requiredDocumentsByKind = {
  visa: [
    "Photo du passeport non israelien",
    "Formulaire de visa rempli",
    "Acte de naissance",
    "Certificat d'etudiant ou Massa",
  ],
  koupat: [
    "Photo du passeport non israelien",
    "Formulaire koupat holim rempli",
    "Certificat d'etudiant ou Massa",
  ],
} as const;

function toRequestType(kind: ServiceRequestInput["kind"]) {
  return kind === "visa"
    ? ServiceRequestType.VISA_STUDENT
    : ServiceRequestType.KOUPAT_HOLIM;
}

function toPayload(input: ServiceRequestInput): Prisma.JsonObject {
  return {
    kind: input.kind,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    birthDate: input.birthDate,
    nationality: input.nationality,
    passportNumber: input.passportNumber,
    school: input.school,
    message: input.message,
    acceptTerms: input.acceptTerms,
    personStatus: input.kind === "visa" ? input.personStatus : null,
    requiredDocuments: [...requiredDocumentsByKind[input.kind]],
  };
}

export async function createServiceRequest(
  rawInput: unknown,
  documents: ServiceRequestDocumentInput[] = [],
): Promise<ServiceRequest> {
  const input = normalizeRequestInput(rawInput);
  const fullName = `${input.firstName} ${input.lastName}`.trim();

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: input.email },
      create: {
        email: input.email,
        name: fullName,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
      update: {
        name: fullName,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
    });

    const request = await tx.serviceRequest.create({
      data: {
        type: toRequestType(input.kind),
        userId: user.id,
        payload: toPayload(input),
        publicNote:
          "Demande recue. L'equipe Bnei Yeshivot va verifier le dossier.",
        documents:
          documents.length > 0
            ? {
                create: documents.map((document) => ({
                  label: document.label,
                  fileKey: document.fileKey,
                  mimeType: document.mimeType,
                })),
              }
            : undefined,
        messages: {
          create: {
            body: "Dossier cree. Les documents seront verifies par l'equipe.",
          },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: "service_request.created",
        entity: "ServiceRequest",
        entityId: request.id,
        metadata: {
          type: request.type,
          source: "website",
        },
      },
    });

    return request;
  });
}
