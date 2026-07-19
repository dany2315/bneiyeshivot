"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { fileUrl } from "@/lib/files";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  Film,
  ImageIcon,
  Images,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

type GalleryItemType = "IMAGE" | "VIDEO" | "YOUTUBE";

export type AdminGalleryAlbum = {
  id: string;
  title: string;
  description: string;
  active: boolean;
  sortOrder: number;
  items: Array<{
    id: string;
    type: GalleryItemType;
    title: string | null;
    description: string | null;
    key: string | null;
    url: string | null;
    mimeType: string | null;
  }>;
};

type Slot = {
  id: string;
  type: GalleryItemType;
  title: string;
  description: string;
  key: string;
  url: string;
  preview: string;
  persisted: boolean;
  status: "ready" | "uploading" | "error";
};

type UploadedFile = { key: string; mimeType: string; size: number };

function youtubeEmbed(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const match = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : trimmed;
}

function slotsFromAlbum(album?: AdminGalleryAlbum): Slot[] {
  return (
    album?.items.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title ?? "",
      description: item.description ?? "",
      key: item.key ?? "",
      url: item.url ?? "",
      preview:
        item.type === "YOUTUBE"
          ? youtubeEmbed(item.url ?? "")
          : fileUrl(item.key) ?? "",
      persisted: true,
      status: "ready" as const,
    })) ?? []
  );
}

async function uploadFiles(files: File[]) {
  const formData = new FormData();
  formData.append("prefix", "home/gallery");
  files.forEach((file) => formData.append("files", file));

  const response = await fetch("/api/uploads", { method: "POST", body: formData });
  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    files?: UploadedFile[];
    message?: string;
  } | null;

  if (!response.ok || !data?.ok || !data.files) {
    throw new Error(data?.message ?? "Upload echoue.");
  }

  return data.files;
}

async function deleteNewUpload(key: string) {
  if (!key) return;
  await fetch("/api/uploads", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  }).catch(() => undefined);
}

export function AdminHomeGalleryClient({
  albums,
  createAction,
  updateAction,
  deleteAction,
}: {
  albums: AdminGalleryAlbum[];
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <>
      <div className="admin-header">
        <div>
          <span className="eyebrow">Page d&apos;accueil</span>
          <h1>Galerie</h1>
        </div>
        <AlbumDialog action={createAction} mode="create" />
      </div>

      <section className="section">
        {albums.length === 0 ? (
          <Card>
            <CardContent className="grid place-items-center gap-4 py-12 text-center">
              <Images className="size-12 text-[var(--muted)]" />
              <div>
                <p className="text-lg font-bold text-[var(--primary)]">
                  Aucune galerie configuree
                </p>
                <p className="text-base text-[var(--muted)]">
                  Creez un premier album pour remplacer la galerie par defaut.
                </p>
              </div>
              <AlbumDialog action={createAction} mode="create" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {albums.map((album) => (
              <Card className="overflow-hidden" key={album.id}>
                <div className="gallery-card-mosaic bg-[var(--subtle)]">
                  {album.items.slice(0, 5).map((item, index) => (
                    <div
                      className={
                        index === 0
                          ? "gallery-mosaic-cell gallery-mosaic-main"
                          : "gallery-mosaic-cell"
                      }
                      key={item.id}
                    >
                      <Media
                        description={item.description}
                        preview={
                          item.type === "YOUTUBE"
                            ? youtubeEmbed(item.url ?? "")
                            : fileUrl(item.key) ?? ""
                        }
                        title={item.title}
                        type={item.type}
                      />
                    </div>
                  ))}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid gap-2">
                      <CardTitle>{album.title}</CardTitle>
                      <CardDescription>{album.description}</CardDescription>
                    </div>
                    <Badge variant={album.active ? "success" : "warning"}>
                      {album.active ? "En ligne" : "Masque"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge variant="info">{album.items.length} media(s)</Badge>
                  <AlbumDialog action={updateAction} album={album} mode="edit" />
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button variant="ghost">
                          <Trash2 className="size-4" />
                          Supprimer
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette galerie ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          L&apos;album et ses fichiers S3 seront supprimes.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <form action={deleteAction}>
                          <input name="albumId" type="hidden" value={album.id} />
                          <AlertDialogAction type="submit" variant="destructive">
                            Supprimer
                          </AlertDialogAction>
                        </form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function AlbumDialog({
  mode,
  album,
  action,
}: {
  mode: "create" | "edit";
  album?: AdminGalleryAlbum;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(album?.title ?? "");
  const [description, setDescription] = useState(album?.description ?? "");
  const [active, setActive] = useState(album?.active ?? true);
  const [sortOrder, setSortOrder] = useState(String(album?.sortOrder ?? 0));
  const [slots, setSlots] = useState<Slot[]>(() => slotsFromAlbum(album));
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const counter = useRef(0);

  function reset() {
    setTitle(album?.title ?? "");
    setDescription(album?.description ?? "");
    setActive(album?.active ?? true);
    setSortOrder(String(album?.sortOrder ?? 0));
    setSlots(slotsFromAlbum(album));
  }

  async function addLocalFiles(files: File[]) {
    if (files.length === 0) return;

    const pending = files.map((file) => {
      counter.current += 1;
      return {
        id: `new-${Date.now()}-${counter.current}`,
        type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
        title: "",
        description: "",
        key: "",
        url: "",
        preview: URL.createObjectURL(file),
        persisted: false,
        status: "uploading" as const,
      } satisfies Slot;
    });

    setSlots((current) => [...current, ...pending]);
    setUploading(true);

    try {
      const uploaded = await uploadFiles(files);
      setSlots((current) =>
        current.map((slot) => {
          const index = pending.findIndex((item) => item.id === slot.id);
          if (index < 0) return slot;
          const media = uploaded[index];
          return media
            ? {
                ...slot,
                key: media.key,
                preview: fileUrl(media.key) ?? slot.preview,
                status: "ready" as const,
              }
            : { ...slot, status: "error" as const };
        }),
      );
      toast.success(`${uploaded.length} media(s) uploade(s).`);
    } catch (error) {
      setSlots((current) =>
        current.map((slot) =>
          pending.some((item) => item.id === slot.id)
            ? { ...slot, status: "error" as const }
            : slot,
        ),
      );
      toast.error(error instanceof Error ? error.message : "Upload impossible.");
    } finally {
      setUploading(false);
    }
  }

  function addYoutube() {
    counter.current += 1;
    setSlots((current) => [
      ...current,
      {
        id: `yt-${Date.now()}-${counter.current}`,
        type: "YOUTUBE",
        title: "",
        description: "",
        key: "",
        url: "",
        preview: "",
        persisted: false,
        status: "ready",
      },
    ]);
  }

  function updateSlot(id: string, patch: Partial<Slot>) {
    setSlots((current) =>
      current.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)),
    );
  }

  function moveSlot(index: number, offset: -1 | 1) {
    setSlots((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  }

  async function removeSlot(slot: Slot) {
    setSlots((current) => current.filter((item) => item.id !== slot.id));
    if (!slot.persisted && slot.key) {
      await deleteNewUpload(slot.key);
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading || slots.some((slot) => slot.status === "uploading")) {
      toast.error("Un upload est encore en cours.");
      return;
    }
    if (slots.some((slot) => slot.status === "error")) {
      toast.error("Retirez les medias en erreur avant d'enregistrer.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        await action(formData);
        toast.success("Galerie enregistree.");
        setOpen(false);
        if (mode === "create") reset();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Enregistrement echoue.");
      }
    });
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        if (uploading || isPending) return;
        setOpen(next);
      }}
      open={open}
    >
      <DialogTrigger
        render={
          mode === "edit" ? (
            <Button variant="secondary">
              <Pencil className="size-4" />
              Modifier
            </Button>
          ) : (
            <Button>
              <Plus className="size-4" />
              Ajouter une galerie
            </Button>
          )
        }
      />
      <DialogContent showCloseButton={false} className="max-h-[92vh] overflow-hidden p-0 sm:max-w-6xl">
        <DialogHeader className="sticky top-0 z-20 grid grid-cols-[1fr_auto] items-start gap-3 border-b border-[var(--border)] bg-popover p-4">
          <div className="grid gap-2">
            <DialogTitle>{mode === "edit" ? "Modifier la galerie" : "Nouvelle galerie"}</DialogTitle>
            <DialogDescription>
              La preview reprend le rendu de la galerie de la page d&apos;accueil.
            </DialogDescription>
          </div>
          <DialogClose render={<Button aria-label="Fermer" variant="ghost" size="icon-sm" />}>
            <X className="size-4" />
          </DialogClose>
        </DialogHeader>

        <div className="max-h-[calc(92vh-96px)] overflow-y-auto p-4">
          <form className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]" onSubmit={submit}>
            <fieldset className="m-0 grid gap-4 border-0 p-0 disabled:opacity-60" disabled={isPending}>
              {album && <input name="albumId" type="hidden" value={album.id} />}
              <div className="grid gap-4 md:grid-cols-[1fr_140px]">
                <Field label="Titre de la galerie" required>
                  <Input name="title" onChange={(event) => setTitle(event.target.value)} placeholder="Photos" required value={title} />
                </Field>
                <Field label="Ordre">
                  <Input name="sortOrder" onChange={(event) => setSortOrder(event.target.value)} type="number" value={sortOrder} />
                </Field>
              </div>
              <Field label="Description courte" required>
                <Textarea
                  name="description"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Moments de vie, rencontres et ambiance Bnei Yeshivot."
                  required
                  value={description}
                />
              </Field>
              <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3 text-base font-semibold text-[var(--primary)]">
                <input checked={active} name="active" onChange={(event) => setActive(event.target.checked)} type="checkbox" />
                Afficher sur la page d&apos;accueil
              </label>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => inputRef.current?.click()} type="button" variant="secondary">
                  <Upload className="size-4" />
                  Uploader images/videos
                </Button>
                <Button onClick={addYoutube} type="button" variant="secondary">
                  <Film className="size-4" />
                  Ajouter YouTube
                </Button>
                <input
                  accept="image/*,video/*"
                  className="sr-only"
                  multiple
                  onChange={(event) => {
                    void addLocalFiles(Array.from(event.target.files ?? []));
                    event.target.value = "";
                  }}
                  ref={inputRef}
                  type="file"
                />
              </div>

              <div className="grid gap-3">
                {slots.map((slot, index) => (
                  <div className="grid gap-3 rounded-xl border border-[var(--border)] p-3 md:grid-cols-[132px_1fr_auto]" key={slot.id}>
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-[var(--subtle)]">
                      <Media
                        description={slot.description}
                        preview={slot.preview}
                        title={slot.title}
                        type={slot.type}
                      />
                      {slot.status === "uploading" && (
                        <span className="absolute inset-0 grid place-items-center bg-white/75">
                          <Spinner />
                        </span>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Badge variant={slot.type === "YOUTUBE" ? "warning" : "info"}>
                        {slot.type === "YOUTUBE" ? "YouTube" : slot.type === "VIDEO" ? "Video" : "Image"}
                      </Badge>
                      {slot.type === "YOUTUBE" && (
                        <Input
                          onChange={(event) => {
                            const embed = youtubeEmbed(event.target.value);
                            updateSlot(slot.id, { url: embed, preview: embed });
                          }}
                          placeholder="Lien YouTube"
                          value={slot.url}
                        />
                      )}
                      <Input onChange={(event) => updateSlot(slot.id, { title: event.target.value })} placeholder="Titre optionnel" value={slot.title} />
                      <Input onChange={(event) => updateSlot(slot.id, { description: event.target.value })} placeholder="Description optionnelle" value={slot.description} />
                      <input name="itemTypes" type="hidden" value={slot.type} />
                      <input name="itemKeys" type="hidden" value={slot.key} />
                      <input name="itemUrls" type="hidden" value={slot.url} />
                      <input name="itemTitles" type="hidden" value={slot.title} />
                      <input name="itemDescriptions" type="hidden" value={slot.description} />
                    </div>
                    <div className="flex gap-1 md:flex-col">
                      <Button disabled={index === 0} onClick={() => moveSlot(index, -1)} size="sm" type="button" variant="ghost">
                        Monter
                      </Button>
                      <Button disabled={index === slots.length - 1} onClick={() => moveSlot(index, 1)} size="sm" type="button" variant="ghost">
                        Descendre
                      </Button>
                      <Button aria-label="Supprimer" onClick={() => void removeSlot(slot)} size="icon-sm" type="button" variant="ghost">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-fit" disabled={isPending || uploading} type="submit">
                {isPending || uploading ? (
                  <>
                    <Spinner />
                    {uploading ? "Upload en cours..." : "Enregistrement..."}
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </fieldset>

            <div className="grid h-fit gap-4 rounded-2xl bg-[var(--subtle)] p-4">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                <Eye className="size-4" />
                Preview page d&apos;accueil
              </span>
              <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
                <div className="gallery-card-mosaic">
                  {slots.slice(0, 5).map((slot, index) => (
                    <div className={index === 0 ? "gallery-mosaic-cell gallery-mosaic-main" : "gallery-mosaic-cell"} key={slot.id}>
                      <Media
                        description={slot.description}
                        preview={slot.preview}
                        title={slot.title}
                        type={slot.type}
                      />
                    </div>
                  ))}
                  {slots.length === 0 && (
                    <div className="gallery-mosaic-cell gallery-mosaic-main">
                      <ImageIcon className="size-10 text-[var(--muted)]" />
                    </div>
                  )}
                </div>
                <div className="grid gap-2 p-5">
                  <Badge variant="info">{slots.length} media(s)</Badge>
                  <strong className="text-2xl text-[var(--primary)]">{title || "Photos"}</strong>
                  <p className="text-base text-[var(--muted)]">{description || "Moments de vie..."}</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label className="text-base font-semibold text-[var(--primary)]">
        {label}
        {required && <span className="text-[var(--accent)]"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Media({
  description,
  preview,
  title,
  type,
}: {
  description?: string | null;
  preview: string;
  title?: string | null;
  type: GalleryItemType;
}) {
  const overlay =
    title || description ? (
      <div className="gallery-media-overlay">
        {title ? <strong>{title}</strong> : null}
        {description ? <span>{description}</span> : null}
      </div>
    ) : null;

  if (!preview) {
    return (
      <div className="grid h-full w-full place-items-center bg-[var(--subtle)]">
        <ImageIcon className="size-7 text-[var(--muted)]" />
      </div>
    );
  }

  if (type === "VIDEO") {
    return (
      <>
        <video className="h-full w-full object-cover" muted playsInline preload="metadata" src={preview} />
        {overlay}
      </>
    );
  }

  if (type === "YOUTUBE") {
    return (
      <div className="relative h-full w-full bg-[#061e35]">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
          src={preview}
          title="Apercu YouTube"
        />
        <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-[var(--primary)]">
          <Film className="size-3" />
          Video
        </span>
        {overlay}
      </div>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="h-full w-full object-cover" src={preview} />
      {overlay}
    </>
  );
}
