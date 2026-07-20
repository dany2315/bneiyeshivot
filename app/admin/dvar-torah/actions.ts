"use server";

import { DvarTorahCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFileToS3 } from "@/lib/uploads";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || `feuillet-${Date.now()}`;
  let slug = base;
  let index = 2;

  while (await prisma.dvarTorahFile.findUnique({ where: { slug } })) {
    slug = `${base}-${index}`;
    index += 1;
  }

  return slug;
}

export async function createDvarTorahFile(formData: FormData) {
  await requireAdminUser();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const file = formData.get("file");
  const published = formData.get("published") === "on";

  if (!title) {
    throw new Error("Le nom du feuillet est obligatoire.");
  }

  if (category !== DvarTorahCategory.CHABBAT && category !== DvarTorahCategory.FETE) {
    throw new Error("Catégorie invalide.");
  }

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Le fichier PDF est obligatoire.");
  }

  if (file.type && file.type !== "application/pdf") {
    throw new Error("Seuls les fichiers PDF sont acceptes.");
  }

  const uploaded = await uploadFileToS3(file, "dvar-torah");

  if (!uploaded) {
    throw new Error("Upload impossible.");
  }

  await prisma.dvarTorahFile.create({
    data: {
      title,
      slug: await uniqueSlug(title),
      description: description || null,
      category,
      fileKey: uploaded.key,
      fileUrl: uploaded.url,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      published,
    },
  });

  revalidatePath("/admin/dvar-torah");
  revalidatePath("/dvar-torah");
}

export async function updateDvarTorahPublication(formData: FormData) {
  await requireAdminUser();

  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "on";

  await prisma.dvarTorahFile.update({
    where: { id },
    data: { published },
  });

  revalidatePath("/admin/dvar-torah");
  revalidatePath("/dvar-torah");
}

export async function deleteDvarTorahFile(formData: FormData) {
  await requireAdminUser();

  const id = String(formData.get("id") ?? "");

  await prisma.dvarTorahFile.delete({
    where: { id },
  });

  revalidatePath("/admin/dvar-torah");
  revalidatePath("/dvar-torah");
}
