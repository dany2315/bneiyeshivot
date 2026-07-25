import {
  Prisma,
  ServiceRequestType,
  UserAccountType,
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

export type CreateServiceRequestOptions = {
  actorUserId?: string | null;
};

const requiredDocumentsByKind = {
  visa: [
    "Photo du passeport non israélien",
    "Formulaire de visa rempli",
    "Acte de naissance",
    "Certificat d’étudiant ou Massa",
  ],
  koupat: [
    "Photo du passeport non israélien",
    "Formulaire Koupat Holim rempli",
    "Certificat d’étudiant ou Massa",
  ],
} as const;

function toRequestType(kind: ServiceRequestInput["kind"]) {
  return kind === "visa"
    ? ServiceRequestType.VISA_STUDENT
    : ServiceRequestType.KOUPAT_HOLIM;
}

function toPayload(
  input: ServiceRequestInput,
  source: "BAHOUR" | "YESHIVA" | "WEBSITE",
): Prisma.JsonObject {
  return {
    kind: input.kind,
    source,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    parentPhone: input.parentPhone,
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
  options: CreateServiceRequestOptions = {},
): Promise<ServiceRequest> {
  const input = normalizeRequestInput(rawInput);
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const programType =
    input.kind === "visa" ? input.personStatus : input.school;

  return prisma.$transaction(async (tx) => {
    const actor = options.actorUserId
      ? await tx.user.findUnique({
          where: { id: options.actorUserId },
          select: { id: true, accountType: true },
        })
      : null;
    const isYeshivaActor = actor?.accountType === UserAccountType.YESHIVA;
    const source = isYeshivaActor
      ? "YESHIVA"
      : actor
        ? "BAHOUR"
        : "WEBSITE";
    const user = isYeshivaActor
      ? actor
      : await tx.user.upsert({
          where: { email: input.email },
          create: {
            email: input.email,
            name: fullName,
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            parentPhone: input.parentPhone,
            programType,
            accountType: UserAccountType.BAHOUR,
          },
          update: {
            name: fullName,
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            parentPhone: input.parentPhone,
            programType,
          },
        });

    const request = await tx.serviceRequest.create({
      data: {
        type: toRequestType(input.kind),
        userId: user.id,
        payload: toPayload(input, source),
        publicNote: "Demande reçue. Le statut de votre demande est déposé.",
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
            body: "Dossier créé. Le statut de votre demande est déposé.",
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
          source,
        },
      },
    });

    return request;
  });
}
