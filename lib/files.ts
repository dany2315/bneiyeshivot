// Construit l'URL d'affichage d'un fichier stocke sur S3 (bucket prive).
// On sert les fichiers d'evenement via /api/files/<key> plutot que via une
// URL S3 directe (inaccessible car le bucket n'est pas public).
export function fileUrl(keyOrUrl: string | null | undefined): string | null {
  if (!keyOrUrl) return null;

  if (keyOrUrl.startsWith("data:")) {
    return keyOrUrl;
  }

  if (/^https?:\/\//.test(keyOrUrl)) {
    try {
      const url = new URL(keyOrUrl);
      const bucket = process.env.AWS_S3_BUCKET;
      const region = process.env.AWS_REGION;
      const regionalS3Host =
        bucket && region ? `${bucket}.s3.${region}.amazonaws.com` : "";

      if (
        (regionalS3Host && url.hostname === regionalS3Host) ||
        (bucket && url.hostname === `${bucket}.s3.amazonaws.com`)
      ) {
        return fileUrl(decodeURIComponent(url.pathname.replace(/^\/+/, "")));
      }
    } catch {
      return keyOrUrl;
    }

    return keyOrUrl;
  }

  const encoded = keyOrUrl
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `/api/files/${encoded}`;
}
