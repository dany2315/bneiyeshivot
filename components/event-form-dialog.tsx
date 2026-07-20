"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { fileUrl } from "@/lib/files";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import {
  CalendarDays,
  CalendarPlus,
  Camera,
  Film,
  ImageIcon,
  ImagePlus,
  MapPin,
  Pencil,
  Plus,
  Users,
  X,
} from "lucide-react";

export type EventFormData = {
  id: string;
  title: string;
  description: string;
  body: string;
  location: string;
  startsAt: string; // ISO
  capacity: string; // number string or ""
  requiresRegistration: boolean;
  imageKey: string | null;
  videoUrls: string[];
  gallery: string[];
};

type UploadStatus = "idle" | "uploading" | "done" | "error";

function toDatetimeLocal(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatPreviewDate(value: string) {
  if (!value) return "Date a definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date a definir";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function normalizeVideoUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  const youtube = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([\w-]{11})/,
  );
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
  return trimmed;
}

async function uploadOne(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("files", file);
  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });
  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    keys?: string[];
    message?: string;
  } | null;
  if (!response.ok || !data?.ok || !data.keys?.[0]) {
    throw new Error(data?.message ?? "Upload echoue.");
  }
  return data.keys[0];
}

export function EventFormDialog({
  mode,
  action,
  event,
}: {
  mode: "create" | "edit";
  action: (formData: FormData) => void | Promise<void>;
  event?: EventFormData;
}) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [body, setBody] = useState(event?.body ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [startsAt, setStartsAt] = useState(
    event ? toDatetimeLocal(event.startsAt) : "",
  );
  const [requiresRegistration, setRequiresRegistration] = useState(
    event?.requiresRegistration ?? false,
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(
    event?.imageKey ? fileUrl(event.imageKey) : null,
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    (event?.gallery ?? [])
      .map((key) => fileUrl(key))
      .filter((url): url is string => Boolean(url)),
  );
  const [videoUrls, setVideoUrls] = useState<string[]>(event?.videoUrls ?? []);

  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [uploading, setUploading] = useState(0);
  const [isPending, startTransition] = useTransition();

  const startUpload = useCallback(() => setUploading((n) => n + 1), []);
  const endUpload = useCallback(
    () => setUploading((n) => Math.max(0, n - 1)),
    [],
  );

  const eventIsPast = Boolean(startsAt) && new Date(startsAt) < new Date();

  function resetForm() {
    setTitle(event?.title ?? "");
    setDescription(event?.description ?? "");
    setBody(event?.body ?? "");
    setLocation(event?.location ?? "");
    setStartsAt(event ? toDatetimeLocal(event.startsAt) : "");
    setRequiresRegistration(event?.requiresRegistration ?? false);
    setCoverPreview(event?.imageKey ? fileUrl(event.imageKey) : null);
    setGalleryUrls(
      (event?.gallery ?? [])
        .map((key) => fileUrl(key))
        .filter((url): url is string => Boolean(url)),
    );
    setVideoUrls(event?.videoUrls ?? []);
    setFormKey((key) => key + 1);
  }

  function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (uploading > 0) {
      setError("Des images sont encore en cours d'upload. Patientez un instant.");
      return;
    }
    // On capture les donnees AVANT de desactiver les champs.
    const formData = new FormData(formEvent.currentTarget);
    setError(null);
    setProgress(15);

    const timer = setInterval(() => {
      setProgress((value) => (value < 90 ? value + (90 - value) * 0.15 : value));
    }, 220);

    startTransition(async () => {
      try {
        await action(formData);
        setProgress(100);
        setTimeout(() => {
          setOpen(false);
          setProgress(0);
          if (mode === "create") resetForm();
        }, 500);
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "La publication a echoue. Reessayez.",
        );
        setProgress(0);
      } finally {
        clearInterval(timer);
      }
    });
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        if (isPending) return;
        setOpen(next);
        if (!next) setError(null);
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
              <CalendarPlus />
              Creer un evenement
            </Button>
          )
        }
      />
      <DialogContent
        showCloseButton={false}
        className="max-h-[92vh] overflow-hidden p-0 sm:max-w-5xl"
      >
        <DialogHeader className="sticky top-0 z-20 grid grid-cols-[1fr_auto] items-start gap-3 border-b border-[var(--border)] bg-popover p-4">
          <div className="grid gap-2">
            <DialogTitle>
              {mode === "edit" ? "Modifier l'evenement" : "Creer un evenement"}
            </DialogTitle>
            <DialogDescription>
              La previsualisation a droite montre la card et la page telles
              qu&apos;elles apparaitront sur le site.
            </DialogDescription>
          </div>
          <DialogClose
            render={
              <Button aria-label="Fermer" variant="ghost" size="icon-sm" />
            }
          >
            <X className="size-4" />
          </DialogClose>
        </DialogHeader>

        <div className="max-h-[calc(92vh-96px)] overflow-y-auto p-4">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <fieldset
              className="m-0 grid gap-4 border-0 p-0 disabled:opacity-60"
              disabled={isPending}
              key={formKey}
            >
              {mode === "edit" && event && (
                <input name="eventId" type="hidden" value={event.id} />
              )}

              <Field label="Titre de l'evenement" required>
                <Input
                  name="title"
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Grand Chabbat Bnei Yeshivot"
                  required
                  value={title}
                />
              </Field>

              <Field label="Description courte" required>
                <Textarea
                  name="description"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Une phrase de presentation affichee sur la card."
                  required
                  value={description}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  hint="Date et heure de l'evenement."
                  label="Date de l'evenement"
                  required
                >
                  <Input
                    name="startsAt"
                    onChange={(e) => setStartsAt(e.target.value)}
                    required
                    type="datetime-local"
                    value={startsAt}
                  />
                </Field>
                <Field label="Lieu">
                  <Input
                    name="location"
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Jerusalem"
                    value={location}
                  />
                </Field>
                <Field
                  hint="Affichee comme nombre de participants sur le site."
                  label="Capacite"
                >
                  <Input
                    defaultValue={event?.capacity ?? ""}
                    name="capacity"
                    placeholder="180"
                    type="number"
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3 text-base font-semibold text-[var(--primary)]">
                <input
                  checked={requiresRegistration}
                  name="requiresRegistration"
                  onChange={(e) => setRequiresRegistration(e.target.checked)}
                  type="checkbox"
                />
                Autoriser les inscriptions
              </label>

              <Field
                hint="Texte affiche sur la card (a venir) et sur la page souvenirs (passe)."
                label="Texte de l'evenement"
              >
                <Textarea
                  name="body"
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Deroule, horaires, details..."
                  rows={4}
                  value={body}
                />
              </Field>

              <Field label="Image principale">
                <CoverImageField
                  initialKey={event?.imageKey ?? null}
                  onPreview={setCoverPreview}
                  onUploadEnd={endUpload}
                  onUploadStart={startUpload}
                />
              </Field>

              {eventIsPast ? (
                <>
                  <Field
                    hint="Selectionnez plusieurs images d'un coup. Chaque photo peut etre supprimee."
                    label="Galerie photos"
                  >
                    <GalleryManager
                      initial={event?.gallery ?? []}
                      onChange={setGalleryUrls}
                      onUploadEnd={endUpload}
                      onUploadStart={startUpload}
                    />
                  </Field>

                  <Field
                    hint="Collez un lien (YouTube...). Une preview s'affiche au-dessus."
                    label="Videos"
                  >
                    <VideoManager
                      initial={event?.videoUrls ?? []}
                      onChange={setVideoUrls}
                    />
                  </Field>
                </>
              ) : (
                <p className="rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-3 text-sm text-[var(--muted)]">
                  Pour un evenement a venir, seule l&apos;image principale est
                  utilisee (affichee sur la card). La galerie photos et les
                  videos pourront etre ajoutees une fois l&apos;evenement passe.
                </p>
              )}

              {error && (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}

              {(isPending || progress > 0) && (
                <div className="grid gap-1.5">
                  <Progress value={progress} />
                  <span className="text-sm text-[var(--muted)]">
                    Publication de l&apos;evenement... {Math.round(progress)}%
                  </span>
                </div>
              )}

              <Button
                className="w-fit"
                disabled={isPending || uploading > 0}
                type="submit"
              >
                {isPending ? (
                  <>
                    <Spinner />
                    Publication...
                  </>
                ) : uploading > 0 ? (
                  <>
                    <Spinner />
                    Upload des images...
                  </>
                ) : mode === "edit" ? (
                  "Enregistrer les modifications"
                ) : (
                  "Creer l'evenement"
                )}
              </Button>
            </fieldset>
          </form>

          <div className="grid h-fit gap-4 rounded-2xl bg-[var(--subtle)] p-4">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              Previsualisation
            </span>

            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--muted)]">
                La card
              </p>
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_20px_70px_rgba(6,40,70,0.08)]">
                <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
                  {coverPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={coverPreview}
                    />
                  ) : (
                    <CalendarDays className="size-10 text-white/80" />
                  )}
                  <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
                    <Badge variant={eventIsPast ? "warning" : "info"}>
                      {eventIsPast ? "Passe" : "A venir"}
                    </Badge>
                    {requiresRegistration && !eventIsPast && (
                      <Badge variant="success">Inscription</Badge>
                    )}
                  </div>
                </div>
                <div className="grid gap-3 p-5">
                  <strong className="text-lg text-[var(--primary)]">
                    {title || "Titre de l'evenement"}
                  </strong>
                  <p className="text-sm text-[var(--muted)]">
                    {description || "Description courte de l'evenement."}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-4" />
                      {formatPreviewDate(startsAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-4" />
                      {location || "Lieu a confirmer"}
                    </span>
                  </div>
                  {!eventIsPast && requiresRegistration && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[var(--primary)] px-3 py-1 text-sm font-semibold text-white">
                      <Users className="size-4" />
                      S&apos;inscrire
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--muted)]">
                La page
              </p>
              <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                <div className="relative flex min-h-[180px] items-end bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] p-4">
                  {coverPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      src={coverPreview}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061e35] via-[#061e35]/55 to-transparent" />
                  <div className="relative z-10 text-white">
                    <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">
                      {eventIsPast ? "Passe" : "A venir"}
                    </span>
                    <p className="mt-2 text-xl font-bold">
                      {title || "Titre de l'evenement"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/80">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" />
                        {location || "A confirmer"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Film className="size-3" />
                        {videoUrls.length} video(s)
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Camera className="size-3" />
                        {galleryUrls.length} photo(s)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 bg-white p-4">
                  <MarkdownContent className="grid gap-2 [&_h2]:text-xl [&_h3]:text-lg [&_li]:text-sm [&_li]:leading-6 [&_p]:text-sm [&_p]:leading-6">
                    {body ||
                      description ||
                      "Le texte de l'evenement apparaitra ici."}
                  </MarkdownContent>
                  {galleryUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {galleryUrls.slice(0, 6).map((src, index) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt=""
                          className="aspect-square rounded-lg object-cover"
                          key={`${src}-${index}`}
                          src={src}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-base font-semibold text-[var(--primary)]">
        {label}
        {required && <span className="text-[var(--accent)]"> *</span>}
      </label>
      {hint && <span className="text-sm text-[var(--muted)]">{hint}</span>}
      {children}
    </div>
  );
}

function CoverImageField({
  initialKey,
  onPreview,
  onUploadStart,
  onUploadEnd,
}: {
  initialKey: string | null;
  onPreview: (url: string | null) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}) {
  const id = useId();
  const [key, setKey] = useState(initialKey ?? "");
  const [preview, setPreview] = useState<string | null>(
    initialKey ? fileUrl(initialKey) : null,
  );
  const [status, setStatus] = useState<UploadStatus>(
    initialKey ? "done" : "idle",
  );

  async function handleFile(file: File) {
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    onPreview(localUrl);
    setStatus("uploading");
    onUploadStart();
    try {
      const uploadedKey = await uploadOne(file);
      setKey(uploadedKey);
      setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      onUploadEnd();
    }
  }

  return (
    <div className="grid gap-2">
      <input name="imageKey" type="hidden" value={key} />
      <label className="cursor-pointer" htmlFor={id}>
        <Attachment className="w-full" orientation="vertical" state={status}>
          <AttachmentMedia className="w-full" variant="image">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" src={preview} />
            ) : (
              <ImageIcon />
            )}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>
              {status === "uploading"
                ? "Upload en cours..."
                : status === "error"
                  ? "Echec, cliquez pour reessayer"
                  : preview
                    ? "Image prete"
                    : "Ajouter l'image principale"}
            </AttachmentTitle>
            <AttachmentDescription>Cliquez pour choisir</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      </label>
      <input
        accept="image/*"
        className="sr-only"
        id={id}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        type="file"
      />
    </div>
  );
}

type GallerySlot = {
  id: string;
  key: string;
  preview: string | null;
  status: UploadStatus;
};

function GalleryManager({
  initial,
  onChange,
  onUploadStart,
  onUploadEnd,
}: {
  initial: string[];
  onChange: (urls: string[]) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const counter = useRef(0);
  const [slots, setSlots] = useState<GallerySlot[]>(() =>
    initial.map((key, index) => ({
      id: `existing-${index}`,
      key,
      preview: fileUrl(key),
      status: "done" as const,
    })),
  );

  useEffect(() => {
    onChange(
      slots
        .map((slot) => slot.preview)
        .filter((url): url is string => Boolean(url)),
    );
  }, [slots, onChange]);

  function addFiles(files: File[]) {
    const created = files.map((file) => {
      counter.current += 1;
      return {
        id: `new-${counter.current}-${Date.now()}`,
        file,
        localUrl: URL.createObjectURL(file),
      };
    });

    setSlots((prev) => [
      ...prev,
      ...created.map((item) => ({
        id: item.id,
        key: "",
        preview: item.localUrl,
        status: "uploading" as const,
      })),
    ]);

    // Uploads en parallele pour aller vite.
    for (const item of created) {
      onUploadStart();
      uploadOne(item.file)
        .then((uploadedKey) => {
          setSlots((prev) =>
            prev.map((slot) =>
              slot.id === item.id
                ? { ...slot, key: uploadedKey, status: "done" as const }
                : slot,
            ),
          );
        })
        .catch(() => {
          setSlots((prev) =>
            prev.map((slot) =>
              slot.id === item.id
                ? { ...slot, status: "error" as const }
                : slot,
            ),
          );
        })
        .finally(() => onUploadEnd());
    }
  }

  function removeSlot(id: string) {
    setSlots((prev) => prev.filter((slot) => slot.id !== id));
  }

  return (
    <div className="grid gap-3">
      {slots.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {slots.map((slot) => (
            <div className="grid gap-2" key={slot.id}>
              <Attachment
                className="w-full"
                orientation="vertical"
                state={slot.status}
              >
                <AttachmentMedia className="w-full" variant="image">
                  {slot.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" src={slot.preview} />
                  ) : (
                    <ImageIcon />
                  )}
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>
                    {slot.status === "uploading"
                      ? "Upload..."
                      : slot.status === "error"
                        ? "Echec"
                        : "Photo"}
                  </AttachmentTitle>
                </AttachmentContent>
              </Attachment>
              {slot.status === "done" && slot.key && (
                <input name="galleryKeys" type="hidden" value={slot.key} />
              )}
              <Button
                className="w-fit"
                onClick={() => removeSlot(slot.id)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <X className="size-4" />
                Supprimer
              </Button>
            </div>
          ))}
        </div>
      )}
      <Button
        className="w-fit"
        onClick={() => inputRef.current?.click()}
        type="button"
        variant="secondary"
      >
        <ImagePlus className="size-4" />
        Ajouter des images
      </Button>
      <input
        accept="image/*"
        className="sr-only"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) addFiles(files);
          e.target.value = "";
        }}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}

type VideoSlot = { id: string; raw: string };

function VideoManager({
  initial,
  onChange,
}: {
  initial: string[];
  onChange: (urls: string[]) => void;
}) {
  const [videos, setVideos] = useState<VideoSlot[]>(() =>
    initial.length > 0
      ? initial.map((url, index) => ({ id: `video-${index}`, raw: url }))
      : [{ id: "video-0", raw: "" }],
  );
  const counter = useRef(initial.length);

  function commit(next: VideoSlot[]) {
    setVideos(next);
    onChange(next.map((video) => normalizeVideoUrl(video.raw)).filter(Boolean));
  }

  function setRaw(id: string, raw: string) {
    commit(videos.map((video) => (video.id === id ? { ...video, raw } : video)));
  }

  function addVideo() {
    counter.current += 1;
    commit([...videos, { id: `video-${counter.current}`, raw: "" }]);
  }

  function removeVideo(id: string) {
    const next = videos.filter((video) => video.id !== id);
    counter.current += 1;
    commit(
      next.length > 0 ? next : [{ id: `video-${counter.current}`, raw: "" }],
    );
  }

  return (
    <div className="grid gap-3">
      {videos.map((video) => {
        const embed = normalizeVideoUrl(video.raw);
        return (
          <div
            className="grid gap-2 rounded-xl border border-[var(--border)] p-3"
            key={video.id}
          >
            {embed && (
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full rounded-lg border border-[var(--border)]"
                src={embed}
                title="Apercu video"
              />
            )}
            <div className="flex gap-2">
              <Input
                onChange={(e) => setRaw(video.id, e.target.value)}
                placeholder="Lien video (YouTube...)"
                value={video.raw}
              />
              <input name="videoUrls" type="hidden" value={embed} />
              <Button
                aria-label="Supprimer la video"
                onClick={() => removeVideo(video.id)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}
      <Button
        className="w-fit"
        onClick={addVideo}
        type="button"
        variant="secondary"
      >
        <Plus className="size-4" />
        Ajouter une autre video
      </Button>
    </div>
  );
}
