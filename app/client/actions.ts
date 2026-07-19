"use server";

import { revalidatePath } from "next/cache";
import { ServiceRequestStatus, ServiceRequestType, Prisma } from "@prisma/client";
import { serviceRequestClientUpdatedAdminEmail, sendEmail } from "@/lib/email";
import { requireBahourUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isMivhanRegistrationOpen } from "@/lib/talmoudo-beyado";
import type { TalmoudoActionState } from "@/app/admin/talmoudo-beyado/actions";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function requestTypeLabel(type: ServiceRequestType) {
  return type === ServiceRequestType.VISA_STUDENT
    ? "visa etudiant"
    : type === ServiceRequestType.KOUPAT_HOLIM
      ? "koupat holim"
      : "demande";
}

function requestAdminPath(type: ServiceRequestType) {
  return type === ServiceRequestType.VISA_STUDENT
    ? "visa"
    : type === ServiceRequestType.KOUPAT_HOLIM
      ? "koupat-holim"
      : "contact";
}

export async function updateBahourServiceRequest(formData: FormData) {
  const user = await requireBahourUser();
  const requestId = readString(formData, "requestId");

  if (!requestId) {
    throw new Error("Demande introuvable.");
  }

  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  });

  if (!request || request.userId !== user.id) {
    throw new Error("Demande introuvable.");
  }

  if (request.status !== ServiceRequestStatus.MISSING_DOCUMENTS) {
    throw new Error("Cette demande n'est pas ouverte a la modification.");
  }

  const payload =
    typeof request.payload === "object" && request.payload !== null
      ? ({ ...(request.payload as Record<string, unknown>) } as Record<string, unknown>)
      : {};
  const requestedFields = Array.isArray(payload.__requestedFields)
    ? new Set(
        payload.__requestedFields.filter(
          (field): field is string => typeof field === "string",
        ),
      )
    : null;
  const editableFields = [
    "firstName",
    "lastName",
    "phone",
    "parentPhone",
    "birthDate",
    "nationality",
    "passportNumber",
    "school",
    "personStatus",
  ];

  for (const field of editableFields) {
    if (requestedFields && requestedFields.size > 0 && !requestedFields.has(field)) {
      continue;
    }

    const value = readString(formData, field);
    if (value) {
      payload[field] = value;
    }
  }

  delete payload.__requestedFields;

  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: {
      payload: payload as Prisma.JsonObject,
      status: ServiceRequestStatus.IN_REVIEW,
      publicNote:
        "Informations modifiees par l'utilisateur. L'equipe va verifier la demande.",
      messages: {
        create: {
          authorId: user.id,
          body: "J'ai modifie les informations demandees.",
          isInternal: false,
        },
      },
    },
  });

  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL || "contact@bneiyeshivot.com";
  const email = serviceRequestClientUpdatedAdminEmail({
    adminHref: `${process.env.BETTER_AUTH_URL ?? "https://bneiyeshivot.com"}/admin/${requestAdminPath(request.type)}#request-${request.id}`,
    fullName:
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
    typeLabel: requestTypeLabel(request.type),
  });

  await sendEmail({ to: adminEmail, ...email });
  revalidatePath("/client");
  revalidatePath(`/admin/${requestAdminPath(request.type)}`);
}

export async function updateBahourTalmoudoRegistrationState(
  _state: TalmoudoActionState,
  formData: FormData,
): Promise<TalmoudoActionState> {
  try {
    const user = await requireBahourUser();
    const registrationId = readString(formData, "registrationId");
    const massehet = readString(formData, "massehet");
    const dapim = readString(formData, "dapim");

    if (!registrationId || !massehet || !dapim) {
      throw new Error("Massehet et dapim obligatoires.");
    }

    const registration = await prisma.mivhanRegistration.findUnique({
      where: { id: registrationId },
      include: { session: true },
    });

    if (!registration || registration.userId !== user.id) {
      throw new Error("Inscription introuvable.");
    }

    if (!isMivhanRegistrationOpen(registration.session)) {
      throw new Error("Les inscriptions sont fermees pour ce mivhan.");
    }

    await prisma.mivhanRegistration.update({
      where: { id: registrationId },
      data: { massehet, dapim },
    });

    revalidatePath("/client");

    return { ok: true, message: "Inscription modifiee." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de modifier l'inscription.",
    };
  }
}
