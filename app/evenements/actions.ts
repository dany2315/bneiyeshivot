"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBahourUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function registerForEvent(formData: FormData) {
  const user = await requireBahourUser();
  const eventId = String(formData.get("eventId") ?? "");
  const slug = String(formData.get("slug") ?? "");

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
