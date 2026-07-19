"use server";

import { revalidatePath } from "next/cache";
import { requireBahourUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isMivhanRegistrationOpen } from "@/lib/talmoudo-beyado";
import type { TalmoudoActionState } from "@/app/admin/talmoudo-beyado/actions";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
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
