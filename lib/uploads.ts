import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

function requireS3Config() {
  if (!s3Client || !bucket || !region) {
    throw new Error("Configuration AWS S3 manquante.");
  }

  return { bucket, region, s3Client };
}

export function createS3Key(prefix: string, fileName: string) {
  const extensionName = safeFileName(fileName || "upload");
  return `${prefix}/${Date.now()}-${crypto.randomUUID()}-${extensionName}`;
}

export async function uploadFileToS3(file: File, prefix: string) {
  const config = requireS3Config();

  if (file.size === 0) {
    return null;
  }

  const key = createS3Key(prefix, file.name || "upload");
  const body = Buffer.from(await file.arrayBuffer());

  await config.s3Client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
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

export async function deleteFileFromS3(key: string) {
  // On ne supprime que de vraies cles S3 (on ignore les anciennes URLs completes
  // et les valeurs vides).
  if (!s3Client || !bucket) return;
  if (!key || /^https?:\/\//.test(key) || key.startsWith("data:")) return;

  try {
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: key }),
    );
  } catch (error) {
    console.error("[s3] suppression échouée", key, error);
  }
}

export async function deleteFilesFromS3(keys: string[]) {
  await Promise.all(keys.filter(Boolean).map((key) => deleteFileFromS3(key)));
}

export async function getFileFromS3(key: string) {
  const config = requireS3Config();

  const response = await config.s3Client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
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

export async function createPresignedUploadUrl({
  key,
  contentType,
}: {
  key: string;
  contentType: string;
}) {
  const config = requireS3Config();

  return getSignedUrl(
    config.s3Client,
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentType: contentType || "application/octet-stream",
    }),
    { expiresIn: 60 * 10 },
  );
}
