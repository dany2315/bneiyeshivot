"use server";

import { revalidatePath } from "next/cache";
import {
  EventRegistrationStatus,
  ServiceRequestStatus,
  UserRole,
} from "@prisma/client";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFilesToS3, uploadFileToS3 } from "@/lib/uploads";

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
  const imageUrl = readString(formData, "imageUrl");
  const imageFile = formData.get("imageFile");
  const videoUrls = splitLines(readString(formData, "videoUrls"));
  const location = readString(formData, "location");
  const startsAt = readString(formData, "startsAt");
  const endsAt = readString(formData, "endsAt");
  const capacity = readString(formData, "capacity");
  const requiresRegistration = formData.get("requiresRegistration") === "on";
  const gallery = splitLines(readString(formData, "gallery"));
  const galleryFiles = formData
    .getAll("galleryFiles")
    .filter((file): file is File => file instanceof File);

  if (!title || !description || !startsAt) {
    throw new Error("Titre, description et date obligatoires.");
  }

  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const uploadedImage =
    imageFile instanceof File && imageFile.size > 0
      ? await uploadFileToS3(imageFile, `events/${slug}/cover`)
      : null;
  const uploadedGallery = await uploadFilesToS3(
    galleryFiles,
    `events/${slug}/gallery`,
  );

  const event = await prisma.event.create({
    data: {
      title,
      slug,
      description,
      imageKey: uploadedImage?.url || imageUrl || null,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      location: location || null,
      capacity: capacity ? Number(capacity) : null,
      requiresRegistration,
      content: {
        body,
        videoUrls,
        gallery: [...gallery, ...uploadedGallery.map((file) => file.url)],
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

export async function addEventPastMedia(formData: FormData) {
  const admin = await requireAdminUser();
  const eventId = readString(formData, "eventId");
  const photoUrls = splitLines(readString(formData, "pastPhotos"));
  const photoFiles = formData
    .getAll("pastPhotoFiles")
    .filter((file): file is File => file instanceof File);

  if (!eventId || (photoUrls.length === 0 && photoFiles.length === 0)) {
    throw new Error("Evenement ou photos manquants.");
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
