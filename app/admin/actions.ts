"use server";

import { revalidatePath } from "next/cache";
import {
  EventRegistrationStatus,
  ServiceRequestStatus,
  UserRole,
} from "@prisma/client";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteFilesFromS3, uploadFilesToS3 } from "@/lib/uploads";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function splitLines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readVideoUrls(formData: FormData) {
  return formData
    .getAll("videoUrls")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

// Les fichiers sont uploades cote client via /api/uploads : l'action ne recoit
// que des cles S3 (payload leger, pas de limite de taille des server actions).
function readGalleryKeys(formData: FormData) {
  return formData
    .getAll("galleryKeys")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

export async function updateServiceRequest(formData: FormData) {
  const admin = await requireAdminUser();
  const id = readString(formData, "requestId");
  const status = readString(formData, "status") as ServiceRequestStatus;
  const publicNote = readString(formData, "publicNote");
  const internalNote = readString(formData, "internalNote");

  if (!id || !Object.values(ServiceRequestStatus).includes(status)) {
    throw new Error("Demande ou statut invalide.");
  }

  await prisma.serviceRequest.update({
    where: { id },
    data: {
      status,
      publicNote: publicNote || null,
      internalNote: internalNote || null,
      messages: publicNote
        ? {
            create: {
              authorId: admin.id,
              body: publicNote,
              isInternal: false,
            },
          }
        : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "service_request.updated",
      entity: "ServiceRequest",
      entityId: id,
      metadata: { status },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/client");
}

export async function createEvent(formData: FormData) {
  const admin = await requireAdminUser();
  const title = readString(formData, "title");
  const description = readString(formData, "description");
  const body = readString(formData, "body");
  const imageKey = readString(formData, "imageKey");
  const videoUrls = readVideoUrls(formData);
  const location = readString(formData, "location");
  const startsAt = readString(formData, "startsAt");
  const capacity = readString(formData, "capacity");
  const requiresRegistration = formData.get("requiresRegistration") === "on";
  const gallery = readGalleryKeys(formData);

  if (!title || !description || !startsAt) {
    throw new Error("Titre, description et date obligatoires.");
  }

  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const event = await prisma.event.create({
    data: {
      title,
      slug,
      description,
      imageKey: imageKey || null,
      startsAt: new Date(startsAt),
      location: location || null,
      capacity: capacity ? Number(capacity) : null,
      requiresRegistration,
      content: {
        body,
        videoUrls,
        gallery,
        createdBy: admin.id,
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "event.created",
      entity: "Event",
      entityId: event.id,
      metadata: { slug: event.slug },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/evenements");
}

export async function updateEvent(formData: FormData) {
  const admin = await requireAdminUser();
  const id = readString(formData, "eventId");

  if (!id) {
    throw new Error("Événement introuvable.");
  }

  const existing = await prisma.event.findUnique({ where: { id } });

  if (!existing) {
    throw new Error("Événement introuvable.");
  }

  const title = readString(formData, "title");
  const description = readString(formData, "description");
  const body = readString(formData, "body");
  const location = readString(formData, "location");
  const startsAt = readString(formData, "startsAt");
  const capacity = readString(formData, "capacity");
  const requiresRegistration = formData.get("requiresRegistration") === "on";
  const videoUrls = readVideoUrls(formData);
  const gallery = readGalleryKeys(formData);
  const imageKey = readString(formData, "imageKey");

  if (!title || !description || !startsAt) {
    throw new Error("Titre, description et date obligatoires.");
  }

  // Un événement passe devient visible publiquement une fois que l'admin
  // l'a modifie (texte, photos, videos) via ce formulaire.
  const startDate = new Date(startsAt);
  const pastPublished = startDate < new Date();

  const currentContent =
    existing.content &&
    typeof existing.content === "object" &&
    !Array.isArray(existing.content)
      ? (existing.content as Record<string, unknown>)
      : {};

  const newImageKey = imageKey || existing.imageKey;
  const oldGallery = Array.isArray(currentContent.gallery)
    ? currentContent.gallery.filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  // Images retirees (cover remplacee, photos supprimees) -> a nettoyer sur S3.
  const keysToDelete = [
    ...(existing.imageKey && existing.imageKey !== newImageKey
      ? [existing.imageKey]
      : []),
    ...oldGallery.filter((key) => !gallery.includes(key)),
  ];

  await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      startsAt: startDate,
      endsAt: null,
      location: location || null,
      capacity: capacity ? Number(capacity) : null,
      requiresRegistration,
      imageKey: newImageKey,
      content: {
        ...currentContent,
        body,
        videoUrls,
        gallery,
        pastPublished,
        updatedBy: admin.id,
      },
    },
  });

  await deleteFilesFromS3(keysToDelete);

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "event.updated",
      entity: "Event",
      entityId: id,
      metadata: { slug: existing.slug },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/evenements");
  revalidatePath(`/evenements/${existing.slug}`);
}

export async function deleteEvent(formData: FormData) {
  const admin = await requireAdminUser();
  const id = readString(formData, "eventId");

  if (!id) {
    throw new Error("Événement introuvable.");
  }

  const existing = await prisma.event.findUnique({
    where: { id },
    select: { slug: true, imageKey: true, content: true },
  });

  if (!existing) {
    throw new Error("Événement introuvable.");
  }

  const content =
    existing.content &&
    typeof existing.content === "object" &&
    !Array.isArray(existing.content)
      ? (existing.content as Record<string, unknown>)
      : {};
  const toStringArray = (value: unknown) =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  const filesToDelete = [
    ...(existing.imageKey ? [existing.imageKey] : []),
    ...toStringArray(content.gallery),
    ...toStringArray(content.pastPhotos),
  ];

  // Les inscriptions liees doivent partir avant l'événement (contrainte FK).
  await prisma.$transaction([
    prisma.eventRegistration.deleteMany({ where: { eventId: id } }),
    prisma.event.delete({ where: { id } }),
  ]);

  await deleteFilesFromS3(filesToDelete);

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "event.deleted",
      entity: "Event",
      entityId: id,
      metadata: { slug: existing.slug },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/evenements");
}

export async function addEventPastMedia(formData: FormData) {
  const admin = await requireAdminUser();
  const eventId = readString(formData, "eventId");
  const photoUrls = splitLines(readString(formData, "pastPhotos"));
  const photoFiles = formData
    .getAll("pastPhotoFiles")
    .filter((file): file is File => file instanceof File);

  if (!eventId || (photoUrls.length === 0 && photoFiles.length === 0)) {
    throw new Error("Événement ou photos manquants.");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { content: true, slug: true },
  });
  const currentContent =
    event?.content && typeof event.content === "object" && !Array.isArray(event.content)
      ? (event.content as Record<string, unknown>)
      : {};
  const uploadedPhotos = await uploadFilesToS3(
    photoFiles,
    `events/${eventId}/past-photos`,
  );
  const currentPhotos = Array.isArray(currentContent.pastPhotos)
    ? currentContent.pastPhotos.filter((item): item is string => typeof item === "string")
    : [];

  await prisma.event.update({
    where: { id: eventId },
    data: {
      content: {
        ...currentContent,
        pastPhotos: [
          ...currentPhotos,
          ...photoUrls,
          ...uploadedPhotos.map((file) => file.url),
        ],
        pastPublished: true,
        pastMediaUpdatedBy: admin.id,
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/evenements");
  if (event?.slug) {
    revalidatePath(`/evenements/${event.slug}`);
  }
}

export async function updateEventRegistrationStatus(formData: FormData) {
  await requireAdminUser();
  const registrationId = readString(formData, "registrationId");
  const status = readString(formData, "status") as EventRegistrationStatus;

  if (
    !registrationId ||
    !Object.values(EventRegistrationStatus).includes(status)
  ) {
    throw new Error("Inscription ou statut invalide.");
  }

  await prisma.eventRegistration.update({
    where: { id: registrationId },
    data: { status },
  });

  revalidatePath("/admin");
}

export async function ensureAdminRole(email: string) {
  await prisma.user.update({
    where: { email },
    data: { role: UserRole.ADMIN },
  });
}
