import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const PREFIX = "public/programmes/beth-hamidrach/gallery";
const DEFAULT_SOURCE = path.join(ROOT, "tmp", "beth-hamidrach-drive", "originals");
const DEFAULT_WORK = path.join(ROOT, "tmp", "beth-hamidrach-drive", "processed");
const DEFAULT_MANIFEST = path.join(ROOT, "scripts", "beth-hamidrach-drive-files.json");
const DEFAULT_JSON = path.join(ROOT, "public", "programmes", "beth-hamidrach", "gallery.json");

function argValue(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

function parseEnvFile(filePath) {
  return Object.fromEntries(
    (readTextFile(filePath) ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line
          .slice(index + 1)
          .trim()
          .replace(/^"(.*)"$/, "$1");
        return [key, value];
      }),
  );
}

function readTextFile(filePath) {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function safeFileName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function findSourceFile(sourceDir, expectedName, usedPaths) {
  const files = await readdir(sourceDir, { recursive: true, withFileTypes: true });
  const normalizedExpected = expectedName.toLowerCase();
  const matches = files
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
    .filter((filePath) => path.basename(filePath).toLowerCase() === normalizedExpected)
    .filter((filePath) => fileSize(filePath) > 100_000)
    .filter((filePath) => !usedPaths.has(filePath));

  return matches[0] ?? null;
}

function fileSize(filePath) {
  try {
    return readFileSync(filePath).byteLength;
  } catch {
    return 0;
  }
}

function convertToJpeg(inputPath, outputPath) {
  const stream = largestVideoStream(inputPath);
  const args = [
    "-y",
    "-v",
    "error",
    "-i",
    inputPath,
  ];

  if (stream) {
    args.push("-map", `0:${stream.index}`);
  }

  args.push(
    "-frames:v",
    "1",
    "-vf",
    "scale='min(1600,iw)':-2",
    "-q:v",
    "3",
    outputPath,
  );

  execFileSync("ffmpeg", args, { stdio: "inherit" });
}

function largestVideoStream(filePath) {
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-version",
  ], { stdio: "ignore" });

  const output = execFileSync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "stream=index,width,height",
    "-of",
    "csv=p=0",
    filePath,
  ], { encoding: "utf8" }).trim();

  return output
    .split(/\r?\n/)
    .map((line) => {
      const [index, width, height] = line.split(",").map(Number);
      return { index, width, height, area: width * height };
    })
    .filter((stream) => Number.isFinite(stream.index) && Number.isFinite(stream.area))
    .sort((a, b) => b.area - a.area)[0] ?? null;
}

function imageSize(filePath) {
  const stream = largestVideoStream(filePath);
  if (!stream) {
    throw new Error(`Dimensions introuvables pour ${filePath}.`);
  }

  return { width: stream.width, height: stream.height };
}

function s3ClientFromEnv(env) {
  return new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function uploadToBucket(env, key, body) {
  if (!env.AWS_REGION || !env.AWS_S3_BUCKET || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("Configuration AWS S3 manquante.");
  }

  await s3ClientFromEnv(env).send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: "image/jpeg",
    }),
  );
}

async function main() {
  const sourceDir = path.resolve(argValue("source", DEFAULT_SOURCE));
  const workDir = path.resolve(argValue("work", DEFAULT_WORK));
  const manifestPath = path.resolve(argValue("manifest", DEFAULT_MANIFEST));
  const jsonPath = path.resolve(argValue("json", DEFAULT_JSON));
  const stagingEnv = parseEnvFile(path.join(ROOT, ".env"));
  const mainEnv = parseEnvFile(path.join(ROOT, ".env.production"));
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const usedPaths = new Set();
  const seenHashes = new Set();
  const items = [];

  await mkdir(workDir, { recursive: true });

  for (const [index, file] of manifest.entries()) {
    const sourcePath = await findSourceFile(sourceDir, file.name, usedPaths);
    if (!sourcePath) {
      throw new Error(`Fichier source introuvable : ${file.name}`);
    }

    usedPaths.add(sourcePath);
    const original = await readFile(sourcePath);
    const originalHash = createHash("sha256").update(original).digest("hex");

    if (seenHashes.has(originalHash)) {
      continue;
    }

    seenHashes.add(originalHash);

    const shortHash = originalHash.slice(0, 10);
    const baseName = safeFileName(file.name);
    const outputPath = path.join(workDir, `${String(index + 1).padStart(2, "0")}-${baseName}-${shortHash}.jpg`);
    convertToJpeg(sourcePath, outputPath);

    const body = await readFile(outputPath);
    const key = `${PREFIX}/${path.basename(outputPath)}`;
    const { width, height } = imageSize(outputPath);

    await uploadToBucket(stagingEnv, key, body);
    await uploadToBucket(mainEnv, key, body);

    items.push({
      driveId: file.id,
      originalName: file.name,
      key,
      contentType: "image/jpeg",
      width,
      height,
    });

    console.log(`Upload OK ${items.length}: ${key}`);
  }

  await writeFile(
    jsonPath,
    `${JSON.stringify({ prefix: PREFIX, items }, null, 2)}\n`,
    "utf8",
  );

  console.log(`Galerie écrite : ${jsonPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
