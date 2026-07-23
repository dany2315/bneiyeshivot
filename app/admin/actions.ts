"use server";

import { revalidatePath } from "next/cache";
import {
  CerfaReceiptType,
  DonationFrequency,
  DonationSource,
  EventRegistrationStatus,
  HomeGalleryItemType,
  PaymentStatus,
  Prisma,
  ReceiptStatus,
  ServiceRequestStatus,
  ServiceRequestType,
  StoreReservationStatus,
  StoreVariantOptionType,
  UserRole,
} from "@prisma/client";
import {
  getStripe,
  nextReceiptNumber,
  readDonationAmount,
  receiptStatusFromNeeded,
} from "@/lib/donations";
import { ensureCerfaReceiptForDonation } from "@/lib/cerfa";
import { requireAdminUser } from "@/lib/session";
import {
  sendEmail,
  serviceRequestStatusEmail,
  storeReservationStatusEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { deleteFilesFromS3, uploadFileToS3, uploadFilesToS3 } from "@/lib/uploads";
import { ensureDefaultStorefront, readStorePrice } from "@/lib/store";

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

function storeReservationItemLabel(item: {
  productTitle: string;
  variantLabel: string | null;
}) {
  return item.variantLabel
    ? `${item.productTitle} (${item.variantLabel})`
    : item.productTitle;
}

const storeReservationStatusLabels: Record<StoreReservationStatus, string> = {
  SUBMITTED: "Nouvelle",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  READY: "Prête",
  COLLECTED: "Récupérée",
  CANCELED: "Annulée",
};

const serviceRequestStatusLabels: Record<ServiceRequestStatus, string> = {
  SUBMITTED: "Deposee",
  IN_REVIEW: "En traitement",
  MISSING_DOCUMENTS: "Éléments à modifier",
  APPROVED: "Approuvée",
  REJECTED: "Refusée",
  COMPLETED: "Terminée",
};

function serviceRequestTypeLabel(type: string) {
  return type === "VISA_STUDENT"
    ? "visa étudiant"
    : type === "KOUPAT_HOLIM"
      ? "koupat holim"
      : "demande";
}

function serviceRequestAdminPath(type: string) {
  return type === "VISA_STUDENT"
    ? "visa"
    : type === "KOUPAT_HOLIM"
      ? "koupat-holim"
      : "contact";
}

const editableServiceRequestFields = [
  "firstName",
  "lastName",
  "phone",
  "parentPhone",
  "birthDate",
  "nationality",
  "passportNumber",
  "school",
  "personStatus",
] as const;

function readRequestDocumentIds(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function splitLines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitOptionLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function normalizedVariantLabel(value: string) {
  return value.replace(/\s+/g, " ").trim().toLocaleLowerCase("fr-FR");
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

function readStoreProductVariants(formData: FormData) {
  const ids = formData.getAll("variantId").map((value) => String(value).trim());
  const sizes = formData
    .getAll("variantSize")
    .map((value) => String(value).replace(/\s+/g, " ").trim());
  const cuts = formData
    .getAll("variantCut")
    .map((value) => String(value).replace(/\s+/g, " ").trim());
  const stocks = formData
    .getAll("variantStockQuantity")
    .map((value) => String(value).trim());
  const prices = formData.getAll("variantPrice").map((value) => String(value).trim());
  const activeIndexes = new Set(
    formData
      .getAll("variantActiveIndex")
      .map((value) => Number(String(value)))
      .filter(Number.isFinite),
  );

  return sizes
    .map((size, index) => {
      if (!size) return null;
      const stock = stocks[index] ? Number(stocks[index]) : null;
      const priceCents = prices[index] ? readStorePrice(prices[index]) : 0;

      return {
        id: ids[index] || null,
        size,
        cut: cuts[index] || null,
        priceCents: priceCents > 0 ? priceCents : null,
        stockQuantity: stock == null || !Number.isFinite(stock) ? null : stock,
        active: activeIndexes.has(index),
      };
    })
    .filter((variant): variant is NonNullable<typeof variant> => Boolean(variant));
}

function validateStoreProductVariants(
  variants: ReturnType<typeof readStoreProductVariants>,
) {
  const keys = new Set<string>();

  for (const variant of variants) {
    const key = `${normalizedVariantLabel(variant.size)}::${normalizedVariantLabel(variant.cut ?? "")}`;
    if (keys.has(key)) {
      throw new Error("Chaque variation taille/coupe doit être unique.");
    }
    keys.add(key);
  }
}

function readStoreVariantOptionLabels(formData: FormData, key: string) {
  const labels = splitOptionLines(readString(formData, key));
  const seen = new Set<string>();

  return labels.filter((label) => {
    const normalized = normalizedVariantLabel(label);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

async function syncStoreVariantOptions(
  tx: Prisma.TransactionClient,
  storefrontId: string,
  type: StoreVariantOptionType,
  labels: string[],
) {
  const existingOptions = await tx.storeVariantOption.findMany({
    where: { storefrontId, type },
  });
  const existingByLabel = new Map(
    existingOptions.map((option) => [normalizedVariantLabel(option.label), option]),
  );

  for (const [sortOrder, label] of labels.entries()) {
    const existing = existingByLabel.get(normalizedVariantLabel(label));

    if (existing) {
      await tx.storeVariantOption.update({
        where: { id: existing.id },
        data: { label, active: true, sortOrder },
      });
      continue;
    }

    await tx.storeVariantOption.create({
      data: {
        storefrontId,
        type,
        label,
        active: true,
        sortOrder,
      },
    });
  }

  await tx.storeVariantOption.updateMany({
    where: {
      storefrontId,
      type,
      label:
        labels.length > 0
          ? {
              notIn: labels,
            }
          : undefined,
    },
    data: { active: false },
  });
}

function readHomeGalleryItems(formData: FormData) {
  const types = formData.getAll("itemTypes").map(String);
  const keys = formData.getAll("itemKeys").map((value) => String(value).trim());
  const urls = formData.getAll("itemUrls").map((value) => String(value).trim());
  const mimeTypes = formData
    .getAll("itemMimeTypes")
    .map((value) => String(value).trim());
  const titles = formData.getAll("itemTitles").map((value) => String(value).trim());
  const descriptions = formData
    .getAll("itemDescriptions")
    .map((value) => String(value).trim());

  return types
    .map((type, index) => {
      if (!Object.values(HomeGalleryItemType).includes(type as HomeGalleryItemType)) {
        return null;
      }

      const itemType = type as HomeGalleryItemType;
      const key = keys[index] ?? "";
      const url = urls[index] ?? "";

      if ((itemType === "IMAGE" || itemType === "VIDEO") && !key) return null;
      if (itemType === "YOUTUBE" && !url) return null;

      return {
        type: itemType,
        key: key || null,
        url: url || null,
        mimeType: mimeTypes[index] || null,
        title: titles[index] || null,
        description: descriptions[index] || null,
        sortOrder: index,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function s3KeysFromHomeGalleryItems(
  items: Array<{ key: string | null; type: HomeGalleryItemType }>,
) {
  return items
    .filter(
      (item) =>
        item.key &&
        (item.type === HomeGalleryItemType.IMAGE ||
          item.type === HomeGalleryItemType.VIDEO),
    )
    .map((item) => item.key as string);
}

export async function updateServiceRequest(formData: FormData) {
  const admin = await requireAdminUser();
  const id = readString(formData, "requestId");
  const status = readString(formData, "status") as ServiceRequestStatus;
  const publicNote = readString(formData, "publicNote");
  const internalNote = readString(formData, "internalNote");
  const requestedFields = formData
    .getAll("requestedFields")
    .map(String)
    .filter((field): field is (typeof editableServiceRequestFields)[number] =>
      editableServiceRequestFields.includes(
        field as (typeof editableServiceRequestFields)[number],
      ),
    );
  const requestedDocumentIds = readRequestDocumentIds(
    formData,
    "requestedDocumentIds",
  );

  if (!id || !Object.values(ServiceRequestStatus).includes(status)) {
    throw new Error("Demande ou statut invalide.");
  }

  const existingRequest = await prisma.serviceRequest.findUnique({
    where: { id },
    select: { payload: true },
  });
  const nextPayload =
    typeof existingRequest?.payload === "object" && existingRequest.payload !== null
      ? ({ ...(existingRequest.payload as Record<string, unknown>) } as Record<string, unknown>)
      : {};

  if (status === ServiceRequestStatus.MISSING_DOCUMENTS) {
    nextPayload.__requestedFields = requestedFields;
    nextPayload.__requestedDocumentIds = requestedDocumentIds;
  } else {
    delete nextPayload.__requestedFields;
    delete nextPayload.__requestedDocumentIds;
  }

  const request = await prisma.serviceRequest.update({
    where: { id },
    data: {
      payload: nextPayload as Prisma.JsonObject,
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
    include: { user: true },
  });

  if (request.user?.email) {
    const email = serviceRequestStatusEmail({
      actionHref: `${process.env.BETTER_AUTH_URL ?? "https://bneiyeshivot.com"}/client`,
      firstName: request.user.firstName,
      note: publicNote || null,
      statusLabel: serviceRequestStatusLabels[request.status],
      typeLabel: serviceRequestTypeLabel(request.type),
    });

    await sendEmail({ to: request.user.email, ...email });
  }

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

export async function uploadServiceRequestFinalDocument(formData: FormData) {
  const admin = await requireAdminUser();
  const requestId = readString(formData, "requestId");
  const label = readString(formData, "label") || "Visa reçu";
  const file = formData.get("file");

  if (!requestId || !(file instanceof File) || file.size === 0) {
    throw new Error("Fichier obligatoire.");
  }

  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  });

  if (!request) {
    throw new Error("Demande introuvable.");
  }

  const uploaded = await uploadFileToS3(file, `requests/final/${requestId}`);

  if (!uploaded) {
    throw new Error("Upload impossible.");
  }

  await prisma.requestDocument.create({
    data: {
      requestId,
      label,
      fileKey: uploaded.key,
      mimeType: uploaded.mimeType,
    },
  });

  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: {
      status: ServiceRequestStatus.COMPLETED,
      publicNote:
        label === "Visa reçu"
          ? "Votre visa reçu est disponible dans votre espace."
          : "Un document final est disponible dans votre espace.",
      messages: {
        create: {
          authorId: admin.id,
          body:
            label === "Visa reçu"
              ? "Votre visa reçu est disponible en téléchargement."
              : "Un document final est disponible en téléchargement.",
          isInternal: false,
        },
      },
    },
  });

  if (request.user?.email) {
    const email = serviceRequestStatusEmail({
      actionHref: `${process.env.BETTER_AUTH_URL ?? "https://bneiyeshivot.com"}/client`,
      firstName: request.user.firstName,
      note:
        label === "Visa reçu"
          ? "Votre visa reçu est disponible en téléchargement dans votre espace Bahour."
          : "Un document final est disponible dans votre espace Bahour.",
      statusLabel: serviceRequestStatusLabels.COMPLETED,
      typeLabel: serviceRequestTypeLabel(request.type),
    });

    await sendEmail({ to: request.user.email, ...email });
  }

  revalidatePath(`/admin/${serviceRequestAdminPath(request.type)}`);
  revalidatePath("/client");
}

export async function updateServiceRequestData(formData: FormData) {
  const admin = await requireAdminUser();
  const requestId = readString(formData, "requestId");

  if (!requestId) {
    throw new Error("Demande introuvable.");
  }

  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { documents: true, user: true },
  });

  if (!request) {
    throw new Error("Demande introuvable.");
  }

  const values = Object.fromEntries(
    editableServiceRequestFields.map((field) => [field, readString(formData, field)]),
  ) as Record<(typeof editableServiceRequestFields)[number], string>;
  const currentPayload =
    request.payload && typeof request.payload === "object" && !Array.isArray(request.payload)
      ? (request.payload as Record<string, unknown>)
      : {};
  const nextPayload: Record<string, unknown> = {
    ...currentPayload,
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone,
    parentPhone: values.parentPhone,
    birthDate: values.birthDate,
    nationality: values.nationality,
    passportNumber: values.passportNumber,
    school: values.school,
  };

  if (request.type === ServiceRequestType.VISA_STUDENT) {
    nextPayload.personStatus = values.personStatus;
  } else {
    delete nextPayload.personStatus;
  }

  const fullName = [values.firstName, values.lastName].filter(Boolean).join(" ");
  const programType =
    request.type === ServiceRequestType.VISA_STUDENT
      ? values.personStatus
      : values.school;
  const documentIds = readRequestDocumentIds(formData, "documentId");
  const documentLabels = formData
    .getAll("documentLabel")
    .map((value) => String(value).trim());
  const replacementFiles = formData.getAll("documentFile");
  const deleteDocumentIds = new Set(
    readRequestDocumentIds(formData, "deleteDocumentId"),
  );
  const documentsById = new Map(
    request.documents.map((document) => [document.id, document]),
  );
  const uploadedReplacements: Array<{
    documentId: string;
    fileKey: string;
    mimeType: string;
    oldFileKey: string;
  }> = [];
  const fileKeysToDelete: string[] = [];

  for (const [index, documentId] of documentIds.entries()) {
    const document = documentsById.get(documentId);
    const file = replacementFiles[index];

    if (
      !document ||
      deleteDocumentIds.has(documentId) ||
      !(file instanceof File) ||
      file.size === 0
    ) {
      continue;
    }

    const uploaded = await uploadFileToS3(file, `requests/${requestId}/admin`);

    if (!uploaded) {
      throw new Error("Upload impossible.");
    }

    uploadedReplacements.push({
      documentId,
      fileKey: uploaded.key,
      mimeType: uploaded.mimeType,
      oldFileKey: document.fileKey,
    });
  }

  await prisma.$transaction(async (tx) => {
    if (request.userId) {
      await tx.user.update({
        where: { id: request.userId },
        data: {
          name: fullName || request.user?.name || "",
          firstName: values.firstName || null,
          lastName: values.lastName || null,
          phone: values.phone || null,
          parentPhone: values.parentPhone || null,
          programType: programType || null,
        },
      });
    }

    await tx.serviceRequest.update({
      where: { id: requestId },
      data: {
        payload: nextPayload as Prisma.JsonObject,
      },
    });

    for (const [index, documentId] of documentIds.entries()) {
      const document = documentsById.get(documentId);
      const label = documentLabels[index];

      if (!document || !label) continue;

      await tx.requestDocument.update({
        where: { id: documentId },
        data: { label },
      });
    }

    for (const replacement of uploadedReplacements) {
      await tx.requestDocument.update({
        where: { id: replacement.documentId },
        data: {
          fileKey: replacement.fileKey,
          mimeType: replacement.mimeType,
          status: "RECEIVED",
          rejectionReason: null,
        },
      });
      fileKeysToDelete.push(replacement.oldFileKey);
    }

    for (const documentId of deleteDocumentIds) {
      const document = documentsById.get(documentId);

      if (!document) continue;

      await tx.requestDocument.delete({ where: { id: documentId } });
      fileKeysToDelete.push(document.fileKey);
    }

    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: "service_request.data_updated",
        entity: "ServiceRequest",
        entityId: requestId,
      },
    });
  });

  await deleteFilesFromS3(fileKeysToDelete);

  revalidatePath(`/admin/${serviceRequestAdminPath(request.type)}`);
  revalidatePath("/client");
}

export async function deleteServiceRequest(formData: FormData) {
  const admin = await requireAdminUser();
  const requestId = readString(formData, "requestId");

  if (!requestId) {
    throw new Error("Demande introuvable.");
  }

  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { documents: true },
  });

  if (!request) {
    throw new Error("Demande introuvable.");
  }

  const fileKeys = request.documents.map((document) => document.fileKey);

  await prisma.$transaction(async (tx) => {
    await tx.requestMessage.deleteMany({ where: { requestId } });
    await tx.requestDocument.deleteMany({ where: { requestId } });
    await tx.serviceRequest.delete({ where: { id: requestId } });
    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: "service_request.deleted",
        entity: "ServiceRequest",
        entityId: requestId,
        metadata: { type: request.type },
      },
    });
  });

  await deleteFilesFromS3(fileKeys);

  revalidatePath(`/admin/${serviceRequestAdminPath(request.type)}`);
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
    throw new Error("Evenement introuvable.");
  }

  const existing = await prisma.event.findUnique({ where: { id } });

  if (!existing) {
    throw new Error("Evenement introuvable.");
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

  // Un evenement passe devient visible publiquement une fois que l'admin
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
    throw new Error("Evenement introuvable.");
  }

  const existing = await prisma.event.findUnique({
    where: { id },
    select: { slug: true, imageKey: true, content: true },
  });

  if (!existing) {
    throw new Error("Evenement introuvable.");
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

  // Les inscriptions liees doivent partir avant l'evenement (contrainte FK).
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

export async function createHomeGalleryAlbum(formData: FormData) {
  const admin = await requireAdminUser();
  const title = readString(formData, "title");
  const description = readString(formData, "description");
  const items = readHomeGalleryItems(formData);

  if (!title || !description) {
    throw new Error("Titre et description obligatoires.");
  }

  const album = await prisma.homeGalleryAlbum.create({
    data: {
      title,
      description,
      sortOrder: Number(readString(formData, "sortOrder")) || 0,
      active: formData.get("active") === "on",
      items: { create: items },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "home_gallery_album.created",
      entity: "HomeGalleryAlbum",
      entityId: album.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/galerie");
}

export async function updateHomeGalleryAlbum(formData: FormData) {
  const admin = await requireAdminUser();
  const albumId = readString(formData, "albumId");
  const title = readString(formData, "title");
  const description = readString(formData, "description");
  const items = readHomeGalleryItems(formData);

  if (!albumId || !title || !description) {
    throw new Error("Album invalide.");
  }

  const existing = await prisma.homeGalleryAlbum.findUnique({
    where: { id: albumId },
    include: { items: true },
  });

  if (!existing) {
    throw new Error("Album introuvable.");
  }

  const nextKeys = new Set(
    s3KeysFromHomeGalleryItems(
      items.map((item) => ({ key: item.key, type: item.type })),
    ),
  );
  const keysToDelete = s3KeysFromHomeGalleryItems(existing.items).filter(
    (key) => !nextKeys.has(key),
  );

  await prisma.$transaction([
    prisma.homeGalleryItem.deleteMany({ where: { albumId } }),
    prisma.homeGalleryAlbum.update({
      where: { id: albumId },
      data: {
        title,
        description,
        sortOrder: Number(readString(formData, "sortOrder")) || 0,
        active: formData.get("active") === "on",
        items: { create: items },
      },
    }),
  ]);

  await deleteFilesFromS3(keysToDelete);

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "home_gallery_album.updated",
      entity: "HomeGalleryAlbum",
      entityId: albumId,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/galerie");
}

export async function reorderHomeGalleryAlbum(formData: FormData) {
  const admin = await requireAdminUser();
  const orderedAlbumIds = formData
    .getAll("orderedAlbumIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const albumId = readString(formData, "albumId");
  const direction = readString(formData, "direction");

  if (orderedAlbumIds.length > 1) {
    const existingIds = new Set(
      (
        await prisma.homeGalleryAlbum.findMany({
          select: { id: true },
        })
      ).map((album) => album.id),
    );
    const ordered = orderedAlbumIds.filter((id) => existingIds.has(id));

    await prisma.$transaction(
      ordered.map((id, index) =>
        prisma.homeGalleryAlbum.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: "home_gallery_album.reordered",
        entity: "HomeGalleryAlbum",
        metadata: { orderedAlbumIds: ordered },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/galerie");
    return;
  }

  if (!albumId || (direction !== "up" && direction !== "down")) {
    throw new Error("Ordre de galerie invalide.");
  }

  const albums = await prisma.homeGalleryAlbum.findMany({
    select: { id: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  const currentIndex = albums.findIndex((album) => album.id === albumId);
  const targetIndex =
    direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (
    currentIndex < 0 ||
    targetIndex < 0 ||
    targetIndex >= albums.length
  ) {
    return;
  }

  const ordered = [...albums];
  const [album] = ordered.splice(currentIndex, 1);
  ordered.splice(targetIndex, 0, album);

  await prisma.$transaction(
    ordered.map((item, index) =>
      prisma.homeGalleryAlbum.update({
        where: { id: item.id },
        data: { sortOrder: index },
      }),
    ),
  );

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "home_gallery_album.reordered",
      entity: "HomeGalleryAlbum",
      entityId: albumId,
      metadata: { direction },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/galerie");
}

export async function deleteHomeGalleryAlbum(formData: FormData) {
  const admin = await requireAdminUser();
  const albumId = readString(formData, "albumId");

  if (!albumId) {
    throw new Error("Album introuvable.");
  }

  const existing = await prisma.homeGalleryAlbum.findUnique({
    where: { id: albumId },
    include: { items: true },
  });

  if (!existing) {
    throw new Error("Album introuvable.");
  }

  await prisma.homeGalleryAlbum.delete({ where: { id: albumId } });
  await deleteFilesFromS3(s3KeysFromHomeGalleryItems(existing.items));

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "home_gallery_album.deleted",
      entity: "HomeGalleryAlbum",
      entityId: albumId,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/galerie");
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
          ...uploadedPhotos.map((file) => file.key),
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

export async function updateStorefront(formData: FormData) {
  const admin = await requireAdminUser();
  const storefront = await ensureDefaultStorefront();
  const name = readString(formData, "name");
  const heroTitle = readString(formData, "heroTitle");
  const heroSubtitle = readString(formData, "heroSubtitle");
  const description = readString(formData, "description");
  const sizeOptions = readStoreVariantOptionLabels(formData, "sizeOptions");
  const cutOptions = readStoreVariantOptionLabels(formData, "cutOptions");

  if (!name || !heroTitle || !heroSubtitle || !description) {
    throw new Error("Nom, titre, sous-titre et description obligatoires.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.storefront.update({
      where: { id: storefront.id },
      data: {
        name,
        heroTitle,
        heroSubtitle,
        description,
        pickupDetails: readString(formData, "pickupDetails") || null,
        contactEmail: readString(formData, "contactEmail") || null,
        contactPhone: readString(formData, "contactPhone") || null,
        active: formData.get("active") === "on",
      },
    });

    await syncStoreVariantOptions(
      tx,
      storefront.id,
      StoreVariantOptionType.SIZE,
      sizeOptions,
    );
    await syncStoreVariantOptions(
      tx,
      storefront.id,
      StoreVariantOptionType.CUT,
      cutOptions,
    );

    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: "storefront.updated",
        entity: "Storefront",
        entityId: storefront.id,
      },
    });
  });

  revalidatePath("/admin/boutique");
  revalidatePath("/boutique");
}

export async function createStoreProduct(formData: FormData) {
  const admin = await requireAdminUser();
  const storefront = await ensureDefaultStorefront();
  const title = readString(formData, "title");
  const description = readString(formData, "description");
  const priceCents = readStorePrice(formData.get("price"));
  const imageUrls = formData.getAll("imageUrls").map(String).filter(Boolean);
  const variants = readStoreProductVariants(formData);
  validateStoreProductVariants(variants);

  if (!title || !description || !priceCents) {
    throw new Error("Titre, description et prix obligatoires.");
  }

  const product = await prisma.storeProduct.create({
    data: {
      storefrontId: storefront.id,
      title,
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      description,
      details: readString(formData, "details") || null,
      priceCents,
      currency: "ILS",
      imageUrl: (imageUrls[0] ?? readString(formData, "imageUrl")) || null,
      imageUrls,
      stockQuantity: readString(formData, "stockQuantity")
        ? Number(readString(formData, "stockQuantity"))
        : null,
      active: formData.get("active") === "on",
      featured: formData.get("featured") === "on",
      variants: {
        create: variants.map((variant) => ({
          size: variant.size,
          cut: variant.cut,
          priceCents: variant.priceCents,
          stockQuantity: variant.stockQuantity,
          active: variant.active,
        })),
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "store_product.created",
      entity: "StoreProduct",
      entityId: product.id,
      metadata: { title: product.title },
    },
  });

  revalidatePath("/admin/boutique");
  revalidatePath("/boutique");
}

export async function updateStoreProduct(formData: FormData) {
  const admin = await requireAdminUser();
  const productId = readString(formData, "productId");
  const title = readString(formData, "title");
  const description = readString(formData, "description");
  const priceCents = readStorePrice(formData.get("price"));
  const imageUrls = formData.getAll("imageUrls").map(String).filter(Boolean);
  const variants = readStoreProductVariants(formData);
  validateStoreProductVariants(variants);

  if (!productId || !title || !description || !priceCents) {
    throw new Error("Produit invalide.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.storeProduct.update({
      where: { id: productId },
      data: {
        title,
        description,
        details: readString(formData, "details") || null,
        priceCents,
        currency: "ILS",
        imageUrl: (imageUrls[0] ?? readString(formData, "imageUrl")) || null,
        imageUrls,
        stockQuantity: readString(formData, "stockQuantity")
          ? Number(readString(formData, "stockQuantity"))
          : null,
        active: formData.get("active") === "on",
        featured: formData.get("featured") === "on",
      },
    });

    const keptVariantIds = variants
      .map((variant) => variant.id)
      .filter((id): id is string => Boolean(id));

    await tx.storeProductVariant.deleteMany({
      where: {
        productId,
        id: { notIn: keptVariantIds.length > 0 ? keptVariantIds : [""] },
        reservationItems: { none: {} },
      },
    });

    await tx.storeProductVariant.updateMany({
      where: {
        productId,
        id: { notIn: keptVariantIds.length > 0 ? keptVariantIds : [""] },
      },
      data: { active: false },
    });

    for (const variant of variants) {
      if (variant.id) {
        await tx.storeProductVariant.update({
          where: { id: variant.id },
          data: {
            size: variant.size,
            cut: variant.cut,
            priceCents: variant.priceCents,
            stockQuantity: variant.stockQuantity,
            active: variant.active,
          },
        });
      } else {
        await tx.storeProductVariant.create({
          data: {
            productId,
            size: variant.size,
            cut: variant.cut,
            priceCents: variant.priceCents,
            stockQuantity: variant.stockQuantity,
            active: variant.active,
          },
        });
      }
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "store_product.updated",
      entity: "StoreProduct",
      entityId: productId,
    },
  });

  revalidatePath("/admin/boutique");
  revalidatePath("/boutique");
}

export async function deleteStoreProduct(formData: FormData) {
  const admin = await requireAdminUser();
  const productId = readString(formData, "productId");

  if (!productId) {
    throw new Error("Produit introuvable.");
  }

  const itemCount = await prisma.storeReservationItem.count({
    where: { productId },
  });

  if (itemCount > 0) {
    await prisma.storeProduct.update({
      where: { id: productId },
      data: { active: false },
    });
  } else {
    await prisma.storeProduct.delete({ where: { id: productId } });
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: itemCount > 0 ? "store_product.archived" : "store_product.deleted",
      entity: "StoreProduct",
      entityId: productId,
    },
  });

  revalidatePath("/admin/boutique");
  revalidatePath("/boutique");
}

export async function setStoreProductActive(formData: FormData) {
  const admin = await requireAdminUser();
  const productId = readString(formData, "productId");
  const active = readString(formData, "active") === "true";

  if (!productId) {
    throw new Error("Produit introuvable.");
  }

  await prisma.storeProduct.update({
    where: { id: productId },
    data: { active },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: active ? "store_product.activated" : "store_product.deactivated",
      entity: "StoreProduct",
      entityId: productId,
    },
  });

  revalidatePath("/admin/boutique");
  revalidatePath("/boutique");
}

export async function updateStoreReservation(formData: FormData) {
  const admin = await requireAdminUser();
  const reservationId = readString(formData, "reservationId");
  const status = readString(formData, "status") as StoreReservationStatus;
  const pickupDate = readString(formData, "pickupDate");
  const pickupLocation = readString(formData, "pickupLocation");
  const unavailableItems = readString(formData, "unavailableItems");
  const customerMessage = readString(formData, "customerMessage");
  const notifyCustomer = formData.get("notifyCustomer") === "on";

  if (
    !reservationId ||
    !Object.values(StoreReservationStatus).includes(status)
  ) {
    throw new Error("Reservation ou statut invalide.");
  }

  const reservation = await prisma.storeReservation.update({
    where: { id: reservationId },
    data: {
      status,
      pickupDate: pickupDate ? new Date(pickupDate) : null,
      pickupLocation: pickupLocation || null,
      unavailableItems: unavailableItems || null,
      adminNote: readString(formData, "adminNote") || null,
    },
    include: { items: true },
  });

  if (notifyCustomer) {
    const total = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: reservation.currency,
    }).format(reservation.totalCents / 100);
    const items = reservation.items.map(
      (item) =>
        `${item.quantity} x ${storeReservationItemLabel(item)} - ${new Intl.NumberFormat(
          "fr-FR",
          {
            style: "currency",
            currency: reservation.currency,
          },
        ).format((item.unitCents * item.quantity) / 100)}`,
    );
    const pickupDateLabel = reservation.pickupDate
      ? new Intl.DateTimeFormat("fr-FR", {
          dateStyle: "full",
          timeStyle: "short",
        }).format(reservation.pickupDate)
      : null;
    const email = await storeReservationStatusEmail({
      customerName: reservation.customerName,
      statusLabel: storeReservationStatusLabels[reservation.status],
      total,
      items,
      pickupDate: pickupDateLabel,
      pickupLocation: reservation.pickupLocation,
      unavailableItems: reservation.unavailableItems,
      message: customerMessage || null,
    });

    await sendEmail({
      to: reservation.customerEmail,
      ...email,
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "store_reservation.updated",
      entity: "StoreReservation",
      entityId: reservationId,
      metadata: { status, notifyCustomer },
    },
  });

  revalidatePath("/admin/boutique");
}

export async function createManualDonation(formData: FormData) {
  const admin = await requireAdminUser();
  const amountCents = readDonationAmount(formData.get("amount"));
  const currency = readString(formData, "currency").toUpperCase() || "EUR";
  const firstName = readString(formData, "firstName");
  const lastName = readString(formData, "lastName");
  const email = readString(formData, "email").toLowerCase();
  const phone = readString(formData, "phone");
  const source = readString(formData, "source") as DonationSource;
  const receiptNeeded = formData.get("receiptNeeded") === "on";
  const createReceipt = formData.get("createReceipt") === "on";

  if (!amountCents || !email || !Object.values(DonationSource).includes(source)) {
    throw new Error("Don manuel invalide.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const donation = await prisma.donation.create({
    data: {
      userId: user?.id,
      provider: "STRIPE",
      source,
      status: PaymentStatus.PAID,
      frequency: DonationFrequency.ONE_TIME,
      amountCents,
      currency,
      donorEmail: email,
      donorFirstName: firstName || null,
      donorLastName: lastName || null,
      donorName: [firstName, lastName].filter(Boolean).join(" ") || email,
      donorPhone: phone || null,
      dedication: readString(formData, "dedication") || null,
      receiptNeeded,
      receiptStatus: createReceipt
        ? ReceiptStatus.GENERATED
        : receiptStatusFromNeeded(receiptNeeded),
      paidAt: new Date(),
      metadata: {
        manual: true,
        createdBy: admin.id,
      },
    },
  });

  if (createReceipt) {
    await upsertReceiptForDonation(donation.id, formData);
    await ensureCerfaReceiptForDonation(donation.id);
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.manual_created",
      entity: "Donation",
      entityId: donation.id,
      metadata: { source, amountCents, currency },
    },
  });

  revalidatePath("/admin/dons");
}

export async function upsertReceiptForDonation(
  donationId: string,
  formData: FormData,
) {
  const receiptType = readString(formData, "receiptType") as CerfaReceiptType;
  const fiscalYear = Number(readString(formData, "fiscalYear")) || new Date().getFullYear();
  const donorType = readString(formData, "donorType") === "ENTREPRISE"
    ? "ENTREPRISE"
    : "PARTICULIER";
  const companyName = readString(formData, "companyName");
  const donorName =
    donorType === "ENTREPRISE"
      ? companyName
      : readString(formData, "receiptDonorName");

  if (!Object.values(CerfaReceiptType).includes(receiptType)) {
    throw new Error("Type de Cerfa invalide.");
  }

  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { receipt: true },
  });

  if (!donation) {
    throw new Error("Don introuvable.");
  }

  const metadata =
    donation.metadata &&
    typeof donation.metadata === "object" &&
    !Array.isArray(donation.metadata)
      ? donation.metadata
      : {};
  const cerfaWasIssued =
    donation.receiptStatus === ReceiptStatus.SENT ||
    typeof (metadata as Record<string, unknown>).cerfaEmailSentAt === "string";
  const regenerateReceiptNumber =
    formData.get("regenerateReceiptNumber") === "on" && cerfaWasIssued;

  const receiptData = {
    type: receiptType,
    fiscalYear,
    donorName: donorName || donation.donorName || donation.donorEmail,
    donorAddress: readString(formData, "receiptAddress") || null,
    donorZip: readString(formData, "receiptZip") || null,
    donorCity: readString(formData, "receiptCity") || null,
    donorCountry: readString(formData, "receiptCountry") || null,
    donorTaxId: readString(formData, "receiptTaxId") || null,
    legalNote: readString(formData, "legalNote") || null,
    metadata: {
      updatedFromAdmin: true,
      paymentSource: donation.source,
    },
  };

  if (donation.receipt) {
    if (regenerateReceiptNumber) {
      await prisma.$transaction(async (tx) => {
        await tx.receipt.update({
          where: { donationId },
          data: {
            ...receiptData,
            number: await nextReceiptNumber(fiscalYear, tx),
            fileKey: null,
            issuedAt: new Date(),
          },
        });
      });
    } else {
      await prisma.receipt.update({
        where: { donationId },
        data: receiptData,
      });
    }
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.receipt.create({
        data: {
          donationId,
          number: await nextReceiptNumber(fiscalYear, tx),
          ...receiptData,
        },
      });
    });
  }

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      receiptNeeded: true,
      receiptStatus: ReceiptStatus.GENERATED,
    },
  });
}

export async function saveDonationReceipt(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");

  if (!donationId) {
    throw new Error("Don introuvable.");
  }

  await upsertReceiptForDonation(donationId, formData);
  await ensureCerfaReceiptForDonation(donationId);

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.receipt_saved",
      entity: "Donation",
      entityId: donationId,
    },
  });

  revalidatePath("/admin/dons");
}

export async function updateDonationStatus(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");
  const status = readString(formData, "status") as PaymentStatus;

  if (!donationId || !Object.values(PaymentStatus).includes(status)) {
    throw new Error("Statut invalide.");
  }

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      status,
      canceledAt: status === PaymentStatus.CANCELED ? new Date() : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.status_updated",
      entity: "Donation",
      entityId: donationId,
      metadata: { status },
    },
  });

  revalidatePath("/admin/dons");
}

export async function updateDonationReceiptStatus(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");
  const receiptStatus = readString(formData, "receiptStatus") as ReceiptStatus;

  if (!donationId || !Object.values(ReceiptStatus).includes(receiptStatus)) {
    throw new Error("Statut de reçu invalide.");
  }

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      receiptNeeded: receiptStatus !== ReceiptStatus.NOT_REQUESTED,
      receiptStatus,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.receipt_status_updated",
      entity: "Donation",
      entityId: donationId,
      metadata: { receiptStatus },
    },
  });

  revalidatePath("/admin/dons");
}

export async function updateDonationAdminNote(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");
  const adminNote = readString(formData, "adminNote");
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    select: { metadata: true },
  });

  if (!donation) {
    throw new Error("Don introuvable.");
  }

  const currentMetadata =
    donation.metadata &&
    typeof donation.metadata === "object" &&
    !Array.isArray(donation.metadata)
      ? (donation.metadata as Record<string, unknown>)
      : {};

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      metadata: {
        ...currentMetadata,
        adminNote,
        adminNoteUpdatedBy: admin.id,
        adminNoteUpdatedAt: new Date().toISOString(),
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.admin_note_updated",
      entity: "Donation",
      entityId: donationId,
    },
  });

  revalidatePath("/admin/dons");
}

export async function refundDonation(formData: FormData) {
  const admin = await requireAdminUser();
  const donationId = readString(formData, "donationId");
  const amount = readString(formData, "refundAmount");
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });

  if (!donation || !donation.stripePaymentIntentId) {
    throw new Error("Paiement Stripe introuvable pour ce don.");
  }

  const refundAmountCents = amount
    ? readDonationAmount(amount)
    : donation.amountCents - donation.refundedAmountCents;

  if (refundAmountCents <= 0) {
    throw new Error("Montant de remboursement invalide.");
  }

  await getStripe().refunds.create({
    payment_intent: donation.stripePaymentIntentId,
    amount: refundAmountCents,
    metadata: {
      donationId,
      adminId: admin.id,
    },
  });

  const totalRefunded = donation.refundedAmountCents + refundAmountCents;

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      refundedAmountCents: totalRefunded,
      refundedAt: new Date(),
      status:
        totalRefunded >= donation.amountCents
          ? PaymentStatus.REFUNDED
          : PaymentStatus.PARTIALLY_REFUNDED,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "donation.refunded",
      entity: "Donation",
      entityId: donationId,
      metadata: { refundAmountCents },
    },
  });

  revalidatePath("/admin/dons");
}
