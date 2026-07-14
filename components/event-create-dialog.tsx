"use client";

import { useEffect, useState } from "react";
import { createEvent } from "@/app/admin/actions";
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
  CalendarDays,
  CalendarPlus,
  Camera,
  Film,
  MapPin,
  Users,
} from "lucide-react";

function formatPreviewDate(value: string) {
  if (!value) return "Date a definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date a definir";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function splitLines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function EventCreateDialog() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [capacity, setCapacity] = useState("");
  const [requiresRegistration, setRequiresRegistration] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState("");
  const [videoUrls, setVideoUrls] = useState("");
  const [imageFileUrl, setImageFileUrl] = useState<string | null>(null);
  const [galleryFileUrls, setGalleryFileUrls] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      if (imageFileUrl) URL.revokeObjectURL(imageFileUrl);
      galleryFileUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFileUrl, galleryFileUrls]);

  const now = new Date();
  const isUpcoming = !startsAt || new Date(startsAt) >= now;
  const coverImage = imageFileUrl || imageUrl || null;
  const galleryPreview = [...galleryFileUrls, ...splitLines(galleryUrls)];
  const videoCount = splitLines(videoUrls).length;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button>
            <CalendarPlus />
            Creer un evenement
          </Button>
        }
      />
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Creer un evenement</DialogTitle>
          <DialogDescription>
            Remplissez les informations : la previsualisation a droite montre la
            card et la page telles qu&apos;elles apparaitront sur le site.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form action={createEvent} className="grid gap-4">
            <Field label="Titre de l'evenement" required>
              <Input
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Grand Chabbat Bnei Yeshivot"
                required
                value={title}
              />
            </Field>

            <Field label="Description courte" required>
              <Textarea
                name="description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Une phrase de presentation affichee sur la card."
                required
                value={description}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                hint="Debut de l'evenement (obligatoire)."
                label="Date de debut"
                required
              >
                <Input
                  name="startsAt"
                  onChange={(event) => setStartsAt(event.target.value)}
                  required
                  type="datetime-local"
                  value={startsAt}
                />
              </Field>
              <Field
                hint="Fin de l'evenement (optionnel)."
                label="Date de fin"
              >
                <Input
                  name="endsAt"
                  onChange={(event) => setEndsAt(event.target.value)}
                  type="datetime-local"
                  value={endsAt}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Lieu">
                <Input
                  name="location"
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Jerusalem"
                  value={location}
                />
              </Field>
              <Field label="Capacite">
                <Input
                  name="capacity"
                  onChange={(event) => setCapacity(event.target.value)}
                  placeholder="180"
                  type="number"
                  value={capacity}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3 text-base font-semibold text-[var(--primary)]">
              <input
                checked={requiresRegistration}
                name="requiresRegistration"
                onChange={(event) =>
                  setRequiresRegistration(event.target.checked)
                }
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
                onChange={(event) => setBody(event.target.value)}
                placeholder="Deroule, horaires, details..."
                rows={4}
                value={body}
              />
            </Field>

            <Field
              hint="Choisissez un fichier ou collez une URL."
              label="Image principale"
            >
              <input
                accept="image/*"
                className="text-sm"
                name="imageFile"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setImageFileUrl(file ? URL.createObjectURL(file) : null);
                }}
                type="file"
              />
              <Input
                className="mt-2"
                name="imageUrl"
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="Ou URL de l'image principale"
                value={imageUrl}
              />
            </Field>

            <Field
              hint="Vous pouvez ajouter plusieurs images."
              label="Galerie photos"
            >
              <input
                accept="image/*"
                className="text-sm"
                multiple
                name="galleryFiles"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  setGalleryFileUrls(
                    files.map((file) => URL.createObjectURL(file)),
                  );
                }}
                type="file"
              />
              <Textarea
                className="mt-2"
                name="gallery"
                onChange={(event) => setGalleryUrls(event.target.value)}
                placeholder="Ou URLs photos, une par ligne"
                value={galleryUrls}
              />
            </Field>

            <Field label="Videos (liens)">
              <Textarea
                name="videoUrls"
                onChange={(event) => setVideoUrls(event.target.value)}
                placeholder="Liens videos, un lien par ligne"
                value={videoUrls}
              />
            </Field>

            <Button className="w-fit" type="submit">
              Creer l&apos;evenement
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
                  {coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={coverImage}
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
                  {coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      src={coverImage}
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
                        {videoCount} video(s)
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Camera className="size-3" />
                        {galleryPreview.length} photo(s)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 bg-white p-4">
                  <p className="whitespace-pre-line text-sm leading-6 text-[var(--primary)]">
                    {body || description || "Le texte de l'evenement apparaitra ici."}
                  </p>
                  {galleryPreview.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {galleryPreview.slice(0, 6).map((src, index) => (
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
