// Construit l'URL d'affichage d'un fichier stocke sur S3 (bucket prive).
// On sert les fichiers d'evenement via /api/files/<key> plutot que via une
// URL S3 directe (inaccessible car le bucket n'est pas public).
export function fileUrl(keyOrUrl: string | null | undefined): string | null {
  if (!keyOrUrl) return null;
  // Anciennes valeurs stockees en URL complete : on les garde telles quelles.
  if (/^https?:\/\//.test(keyOrUrl) || keyOrUrl.startsWith("data:")) {
    return keyOrUrl;
  }
  const encoded = keyOrUrl
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `/api/files/${encoded}`;
}
