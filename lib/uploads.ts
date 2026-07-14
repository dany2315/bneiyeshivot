import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;

const s3Client =
  region && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? new S3Client({
        region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      })
    : null;

function publicUrlForKey(key: string) {
  if (process.env.AWS_PUBLIC_BASE_URL) {
    return `${process.env.AWS_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function uploadFileToS3(file: File, prefix: string) {
  if (!s3Client || !bucket || !region) {
    throw new Error("Configuration AWS S3 manquante.");
  }

  if (file.size === 0) {
    return null;
  }

  const extensionName = safeFileName(file.name || "upload");
  const key = `${prefix}/${Date.now()}-${crypto.randomUUID()}-${extensionName}`;
  const body = Buffer.from(await file.arrayBuffer());

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
    }),
  );

  return {
    key,
    url: publicUrlForKey(key),
    mimeType: file.type || "application/octet-stream",
    size: file.size,
  };
}

export async function uploadFilesToS3(files: File[], prefix: string) {
  const uploaded = await Promise.all(
    files
      .filter((file) => file.size > 0)
      .map((file) => uploadFileToS3(file, prefix)),
  );

  return uploaded.filter(Boolean) as NonNullable<
    Awaited<ReturnType<typeof uploadFileToS3>>
  >[];
}

export async function getFileFromS3(key: string) {
  if (!s3Client || !bucket || !region) {
    throw new Error("Configuration AWS S3 manquante.");
  }

  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error("Fichier S3 vide ou introuvable.");
  }

  const bytes = await response.Body.transformToByteArray();
  const body = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(body).set(bytes);

  return {
    body,
    contentLength: response.ContentLength,
    contentType: response.ContentType,
  };
}
