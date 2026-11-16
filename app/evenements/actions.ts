"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserAccountType } from "@prisma/client";
import { requireBahourUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function registerForEvent(formData: FormData) {
  const user = await requireBahourUser();
  const eventId = String(formData.get("eventId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const submittedParentPhone = String(formData.get("parentPhone") ?? "").trim();
  const needsParentPhone =
    user.accountType !== UserAccountType.YESHIVA && !user.parentPhone?.trim();

  if (!eventId) {
    throw new Error("Événement invalide.");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      slug: true,
      title: true,
      requiresRegistration: true,
      startsAt: true,
    },
  });

  if (!event?.requiresRegistration) {
    redirect(`/evenements/${slug || event?.slug || ""}`);
  }

  // Un Bahour sans téléphone des parents doit le renseigner avant de s'inscrire.
  if (needsParentPhone) {
    if (submittedParentPhone.length < 6) {
      redirect(`/evenements?erreur=telephone-parents#evenement-${event.id}`);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { parentPhone: submittedParentPhone },
    });
  }

  await prisma.eventRegistration.upsert({
    where: {
      eventId_userId: {
        eventId,
        userId: user.id,
      },
    },
    create: {
      eventId,
      userId: user.id,
      payload: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        parentPhone: needsParentPhone ? submittedParentPhone : user.parentPhone,
        source: "espace-bahour",
      },
    },
    update: {},
  });

  revalidatePath("/client");
  revalidatePath("/evenements");
  revalidatePath(`/evenements/${event.slug}`);
  redirect(`/evenements/${event.slug}`);
}
