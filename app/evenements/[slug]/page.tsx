import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PageShell, StatusBadge } from "../../components";
import { prisma } from "@/lib/prisma";
import { formatDateTime, parseEventContent } from "@/lib/event-content";
import { fileUrl } from "@/lib/files";
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
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, Film } from "lucide-react";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });

  if (!event) {
    notFound();
  }

  // Les evenements a venir n'ont pas de page dediee : tout est sur la card.
  if (event.startsAt >= new Date()) {
    redirect("/evenements");
  }

  const content = parseEventContent(event.content);
  const gallery = [...content.gallery, ...content.pastPhotos];
  const galleryPhotos = gallery
    .map((src) => fileUrl(src))
    .filter((src): src is string => Boolean(src));

  return (
    <PageShell>
      <main>
        <section className="relative min-h-[620px] overflow-hidden text-white md:min-h-[72vh]">
          {fileUrl(event.imageKey) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              src={fileUrl(event.imageKey) ?? undefined}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#061e35] via-[#061e35]/55 to-transparent" />
          <div className="container relative z-10 flex min-h-[620px] items-end pb-10 pt-24 md:min-h-[72vh] md:pb-12">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-white">
                Evenement passe
              </span>
              <h1 className="mt-5 text-white">{event.title}</h1>
              <p className="mt-4 text-lg leading-8 text-white/82 md:text-xl">
                {event.description}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <HeroStat label="Lieu" value={event.location || "A confirmer"} />
                <HeroStat
                  label="Participants"
                  value={event.capacity != null ? `${event.capacity}` : "—"}
                />
                <HeroStat
                  label="Medias"
                  value={`${content.videoUrls.length} video(s)`}
                />
              </div>
              <div className="mt-6">
                <Button asChild>
                  <Link className="text-white" href="/evenements">
                    Retour aux evenements
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-6 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader>
                <CardTitle>Presentation</CardTitle>
                <CardDescription>
                  {formatDateTime(event.startsAt)} -{" "}
                  {event.location || "Lieu a confirmer"}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <p className="whitespace-pre-line text-base leading-8 text-[var(--primary)]">
                  {content.body || event.description}
                </p>
                {content.videoUrls.map((videoUrl, index) => (
                  <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="aspect-video w-full rounded-2xl border border-[var(--border)]"
                    key={videoUrl}
                    src={videoUrl}
                    title={`${event.title} video ${index + 1}`}
                  />
                ))}
              </CardContent>
            </Card>

            <aside className="grid h-fit gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                  <CardDescription>
                    {event.location || "Lieu a confirmer"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-base text-[var(--muted)]">
                  <p>Date : {formatDateTime(event.startsAt)}</p>
                  {event.capacity != null && (
                    <p>Participants : {event.capacity}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--subtle)] px-3 py-1">
                      <Film className="size-4" />
                      {content.videoUrls.length} video(s)
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--subtle)] px-3 py-1">
                      <Camera className="size-4" />
                      {galleryPhotos.length} photo(s)
                    </span>
                  </div>
                  <StatusBadge tone="gold">Inscriptions fermees</StatusBadge>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>

        {galleryPhotos.length > 0 && (
          <section className="section band">
            <div className="container">
              <div className="section-header">
                <h2>Galerie apres evenement</h2>
                <p>
                  Photos ajoutees par l&apos;equipe pour raconter
                  l&apos;evenement.
                </p>
              </div>
              <Dialog>
                <DialogTrigger
                  render={
                    <button className="gallery-card-trigger" type="button" />
                  }
                >
                  <Card className="gallery-card event-gallery-card">
                    <div className="gallery-card-mosaic">
                      {galleryPhotos.slice(0, 5).map((photo, photoIndex) => (
                        <div
                          className={
                            photoIndex === 0
                              ? "gallery-mosaic-cell gallery-mosaic-main"
                              : "gallery-mosaic-cell"
                          }
                          key={`${photo}-${photoIndex}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt="" src={photo} />
                        </div>
                      ))}
                    </div>
                    <CardHeader>
                      <Badge variant="info">{galleryPhotos.length} photos</Badge>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>{event.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </DialogTrigger>
                <DialogContent className="gallery-dialog-content max-h-[92vh] overflow-y-auto sm:max-w-5xl">
                  <DialogHeader className="gallery-dialog-header">
                    <DialogTitle>{event.title}</DialogTitle>
                    <DialogDescription>
                      Galerie apres evenement - {galleryPhotos.length} photo(s)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="gallery-dialog-grid">
                    {galleryPhotos.map((photo, photoIndex) => (
                      <div
                        className={
                          photoIndex === 0
                            ? "gallery-dialog-photo gallery-dialog-photo-featured"
                            : "gallery-dialog-photo"
                        }
                        key={`${photo}-${photoIndex}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="" src={photo} />
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </section>
        )}
      </main>
    </PageShell>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
      <span className="block text-xs font-bold uppercase tracking-[0.12em] text-white/58">
        {label}
      </span>
      <strong className="mt-1 block text-base text-white">{value}</strong>
    </div>
  );
}
