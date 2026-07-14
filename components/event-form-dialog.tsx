"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
    event?.imageKey ?? null,
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    event?.gallery ?? [],
  );
  const [videoUrls, setVideoUrls] = useState<string[]>(event?.videoUrls ?? []);

  const now = new Date();
  const isUpcoming = !startsAt || new Date(startsAt) >= now;

  return (
    <Dialog>
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
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Modifier l'evenement" : "Creer un evenement"}
          </DialogTitle>
          <DialogDescription>
            La previsualisation a droite montre la card et la page telles
            qu&apos;elles apparaitront sur le site.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form action={action} className="grid gap-4">
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
              hint="Texte complet affiche sur la card (a venir) et sur la page souvenirs (passe)."
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
              <ImageDropField
                initialUrl={event?.imageKey ?? null}
                name="imageFile"
                onSelect={setCoverPreview}
              />
            </Field>

            <Field
              hint="Ajoutez une image, puis « Ajouter une image » pour en mettre d'autres."
              label="Galerie photos"
            >
              <GalleryManager
                initial={event?.gallery ?? []}
                onChange={setGalleryUrls}
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

            <Button className="w-fit" type="submit">
              {mode === "edit"
                ? "Enregistrer les modifications"
                : "Creer l'evenement"}
            </Button>
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
                    <Badge variant={isUpcoming ? "info" : "warning"}>
                      {isUpcoming ? "A venir" : "Passe"}
                    </Badge>
                    {requiresRegistration && isUpcoming && (
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
                  {isUpcoming && requiresRegistration && (
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
                      {isUpcoming ? "A venir" : "Passe"}
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
                  <p className="whitespace-pre-line text-sm leading-6 text-[var(--primary)]">
                    {body ||
                      description ||
                      "Le texte de l'evenement apparaitra ici."}
                  </p>
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

function ImageDropField({
  name,
  initialUrl,
  onSelect,
  onRemove,
}: {
  name: string;
  initialUrl?: string | null;
  onSelect?: (url: string | null) => void;
  onRemove?: () => void;
}) {
  const id = useId();
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [hasFile, setHasFile] = useState(false);

  return (
    <div className="grid gap-2">
      <label className="cursor-pointer" htmlFor={id}>
        <Attachment
          className="w-full"
          orientation="vertical"
          state={preview ? "done" : "idle"}
        >
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
              {hasFile
                ? "Image prete"
                : preview
                  ? "Image actuelle"
                  : "Ajouter une image"}
            </AttachmentTitle>
            <AttachmentDescription>
              Cliquez pour choisir
            </AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      </label>
      <input
        accept="image/*"
        className="sr-only"
        id={id}
        name={name}
        onChange={(e) => {
          const file = e.target.files?.[0];
          const url = file ? URL.createObjectURL(file) : null;
          setHasFile(Boolean(file));
          const next = url ?? initialUrl ?? null;
          setPreview(next);
          onSelect?.(next);
        }}
        type="file"
      />
      {onRemove && (
        <Button
          className="w-fit"
          onClick={onRemove}
          size="sm"
          type="button"
          variant="ghost"
        >
          <X className="size-4" />
          Supprimer
        </Button>
      )}
    </div>
  );
}

type GallerySlot =
  | { id: string; kind: "existing"; url: string }
  | { id: string; kind: "new"; preview: string | null };

function galleryUrlsOf(slots: GallerySlot[]) {
  return slots
    .map((slot) => (slot.kind === "existing" ? slot.url : slot.preview))
    .filter((value): value is string => Boolean(value));
}

function GalleryManager({
  initial,
  onChange,
}: {
  initial: string[];
  onChange: (urls: string[]) => void;
}) {
  const [slots, setSlots] = useState<GallerySlot[]>(() =>
    initial.map((url, index) => ({
      id: `existing-${index}`,
      kind: "existing" as const,
      url,
    })),
  );
  const counter = useRef(0);

  function commit(next: GallerySlot[]) {
    setSlots(next);
    onChange(galleryUrlsOf(next));
  }

  function addSlot() {
    counter.current += 1;
    commit([
      ...slots,
      { id: `new-${counter.current}`, kind: "new", preview: null },
    ]);
  }

  function removeSlot(id: string) {
    commit(slots.filter((slot) => slot.id !== id));
  }

  function setPreview(id: string, preview: string | null) {
    commit(
      slots.map((slot) =>
        slot.id === id && slot.kind === "new" ? { ...slot, preview } : slot,
      ),
    );
  }

  return (
    <div className="grid gap-3">
      {slots.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {slots.map((slot) =>
            slot.kind === "existing" ? (
              <div className="grid gap-2" key={slot.id}>
                <Attachment
                  className="w-full"
                  orientation="vertical"
                  state="done"
                >
                  <AttachmentMedia className="w-full" variant="image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" src={slot.url} />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>Photo</AttachmentTitle>
                    <AttachmentDescription>Deja en ligne</AttachmentDescription>
                  </AttachmentContent>
                </Attachment>
                <input name="galleryKeep" type="hidden" value={slot.url} />
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
            ) : (
              <ImageDropField
                key={slot.id}
                name="galleryFiles"
                onRemove={() => removeSlot(slot.id)}
                onSelect={(url) => setPreview(slot.id, url)}
              />
            ),
          )}
        </div>
      )}
      <Button
        className="w-fit"
        onClick={addSlot}
        type="button"
        variant="secondary"
      >
        <ImagePlus className="size-4" />
        Ajouter une image
      </Button>
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
