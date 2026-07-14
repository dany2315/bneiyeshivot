import type { Prisma } from "@prisma/client";

export type EventContent = {
  body: string;
  videoUrl: string;
  videoUrls: string[];
  gallery: string[];
  pastPhotos: string[];
};

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function parseEventContent(content: Prisma.JsonValue): EventContent {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return {
      body: "",
      videoUrl: "",
      videoUrls: [],
      gallery: [],
      pastPhotos: [],
    };
  }

  const record = content as Record<string, unknown>;

  const videoUrls = stringArray(record.videoUrls);
  const legacyVideoUrl = typeof record.videoUrl === "string" ? record.videoUrl : "";

  return {
    body: typeof record.body === "string" ? record.body : "",
    videoUrl: legacyVideoUrl,
    videoUrls: videoUrls.length > 0 ? videoUrls : legacyVideoUrl ? [legacyVideoUrl] : [],
    gallery: stringArray(record.gallery),
    pastPhotos: stringArray(record.pastPhotos),
  };
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}
