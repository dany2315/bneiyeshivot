import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell, StatusBadge } from "../../components";
import { registerForEvent } from "../actions";
import {
  getPrototypeEvent,
  prototypeEvents,
  type PrototypeEvent,
} from "@/lib/event-prototypes";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatDateTime, parseEventContent } from "@/lib/event-content";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Film, MapPin, Users } from "lucide-react";

export async function generateStaticParams() {
  const events = await prisma.event.findMany({
    select: { slug: true },
  });

  return [
    ...events.map((event) => ({
      slug: event.slug,
    })),
    ...prototypeEvents.map((event) => ({
      slug: event.slug,
    })),
  ];
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prototype = getPrototypeEvent(slug);

  if (prototype) {
    return <PrototypeEventDetail event={prototype} />;
  }

  const user = await getCurrentUser();
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      _count: { select: { registrations: true } },
      registrations: user
        ? {
            where: { userId: user.id },
            take: 1,
          }
        : false,
    },
  });

  if (!event) {
    notFound();
  }

  const now = new Date();
  const isPast = event.startsAt < now;
  const content = parseEventContent(event.content);
  const isRegistered = event.registrations.length > 0;
  const gallery = isPast
    ? [...content.gallery, ...content.pastPhotos]
    : content.gallery;

  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">
              {isPast ? "Evenement passe" : "Evenement a venir"}
            </span>
            <h1>{event.title}</h1>
            <p>{event.description}</p>
          </div>
        </section>

        <section className="section">
          <div className="container module-grid">
            <div className="grid gap-5">
              {event.imageKey && (
                <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
                  <img
                    alt=""
                    className="aspect-[16/9] w-full object-cover"
                    src={event.imageKey}
                  />
                </div>
              )}

              <Card>
                <CardHeader>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone={isPast ? "gold" : "blue"}>
                      {isPast ? "Passe" : "A venir"}
                    </StatusBadge>
                    {event.requiresRegistration && !isPast && (
                      <StatusBadge tone="green">Inscription ouverte</StatusBadge>
                    )}
                  </div>
                  <CardTitle>Details</CardTitle>
                  <CardDescription>
                    {formatDateTime(event.startsAt)} -{" "}
                    {event.location || "Lieu a confirmer"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {content.body ? (
                    <p className="whitespace-pre-line text-base leading-8 text-[var(--primary)]">
                      {content.body}
                    </p>
                  ) : (
                    <p className="text-base leading-8 text-[var(--primary)]">
                      {event.description}
                    </p>
                  )}

                  {content.videoUrls.map((videoUrl, index) => (
                    <div
                      className="overflow-hidden rounded-2xl border border-[var(--border)]"
                      key={videoUrl}
                    >
                      <iframe
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="aspect-video w-full"
                        src={videoUrl}
                        title={`${event.title} video ${index + 1}`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {gallery.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isPast ? "Photos et souvenirs" : "Galerie"}
                    </CardTitle>
                    <CardDescription>
                      Images ajoutees par l&apos;equipe admin.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    {gallery.map((src) => (
                      <img
                        alt=""
                        className="aspect-[4/3] rounded-xl object-cover"
                        key={src}
                        src={src}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <aside className="grid h-fit gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Participation</CardTitle>
                  <CardDescription>
                    {event._count.registrations} inscription(s) enregistree(s).
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {isPast ? (
                    <StatusBadge tone="gold">Inscriptions fermees</StatusBadge>
                  ) : event.requiresRegistration ? (
                    isRegistered ? (
                      <StatusBadge tone="green">Deja inscrit</StatusBadge>
                    ) : (
                      <form action={registerForEvent}>
                        <input name="eventId" type="hidden" value={event.id} />
                        <input name="slug" type="hidden" value={event.slug} />
                        <Button className="w-full text-white" type="submit">
                          S&apos;inscrire
                        </Button>
                      </form>
                    )
                  ) : (
                    <StatusBadge tone="blue">Sans inscription</StatusBadge>
                  )}
                  {!user && event.requiresRegistration && !isPast && (
                    <p className="text-sm leading-6 text-[var(--muted)]">
                      La connexion a l&apos;Espace Bahour sera demandee avant
                      l&apos;inscription.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                  <CardDescription>{event.location || "Lieu a confirmer"}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-base text-[var(--muted)]">
                  <p>Date : {formatDateTime(event.startsAt)}</p>
                  {event.endsAt && <p>Fin : {formatDateTime(event.endsAt)}</p>}
                  {event.capacity && <p>Capacite : {event.capacity}</p>}
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function PrototypeEventDetail({ event }: { event: PrototypeEvent }) {
  if (event.pageVariant === 1) {
    return (
      <PageShell>
        <main>
          <section className="relative min-h-[620px] overflow-hidden text-white md:min-h-[72vh]">
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              src={event.image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061e35] via-[#061e35]/55 to-transparent" />
            <div className="container relative z-10 flex min-h-[620px] items-end pb-10 pt-24 md:min-h-[72vh] md:pb-12">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-white">
                  {event.eyebrow}
                </span>
                <h1 className="mt-5 text-white">{event.title}</h1>
                <p className="mt-4 text-lg leading-8 text-white/82 md:text-xl">
                  {event.description}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <HeroStat label="Lieu" value={event.location} />
                  <HeroStat label="Participants" value={`${event.registrations}`} />
                  <HeroStat label="Medias" value={`${event.videos.length} video(s)`} />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link className="text-white" href="/evenements">
                      Retour aux evenements
                    </Link>
                  </Button>
                  {event.requiresRegistration && event.mode === "upcoming" && (
                    <Button variant="secondary">S&apos;inscrire</Button>
                  )}
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
                    {event.date} - {event.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <p className="whitespace-pre-line text-base leading-8 text-[var(--primary)]">
                    {event.body}
                  </p>
                  {event.videos.map((src, index) => (
                    <iframe
                      allowFullScreen
                      className="aspect-video w-full rounded-2xl border border-[var(--border)]"
                      key={`${src}-${index}`}
                      src={src}
                      title={`${event.title} video ${index + 1}`}
                    />
                  ))}
                </CardContent>
              </Card>
              <PrototypeSide event={event} />
            </div>
          </section>

          <PrototypeGallery event={event} />
        </main>
      </PageShell>
    );
  }

  if (event.pageVariant === 2) {
    return (
      <PageShell>
        <main>
          <section className="section bg-white">
            <div className="container grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
              <div className="grid content-center gap-5">
                <Badge className="w-fit" variant="info">
                  {event.eyebrow}
                </Badge>
                <h1 className="text-[var(--primary)]">{event.title}</h1>
                <p className="text-lg leading-8 text-[var(--muted)] md:text-xl">
                  {event.description}
                </p>
                <div className="grid gap-3 text-base text-[var(--primary)]">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-5 text-[var(--accent)]" />
                    {event.location}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="size-5 text-[var(--accent)]" />
                    {event.registrations} participants
                  </span>
                </div>
              </div>
              <div className="grid gap-3">
                <img
                  alt=""
                  className="aspect-[4/3] rounded-3xl object-cover shadow-[0_28px_80px_rgba(6,40,70,0.12)]"
                  src={event.image}
                />
                <div className="grid grid-cols-2 gap-3">
                  {event.gallery.slice(0, 2).map((src) => (
                    <img
                      alt=""
                      className="aspect-[4/3] rounded-2xl object-cover"
                      key={src}
                      src={src}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="section band">
            <div className="container grid gap-6 lg:grid-cols-[1fr_360px]">
              <Card>
                <CardHeader>
                  <CardTitle>Contenu de l&apos;evenement</CardTitle>
                  <CardDescription>{event.date}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <p className="whitespace-pre-line text-base leading-8 text-[var(--primary)]">
                    {event.body}
                  </p>
                  <div className="grid gap-4">
                    {event.videos.map((src, index) => (
                      <iframe
                        allowFullScreen
                        className="aspect-video w-full rounded-2xl border border-[var(--border)]"
                        key={`${src}-${index}`}
                        src={src}
                        title={`${event.title} video ${index + 1}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <PrototypeSide event={event} />
            </div>
          </section>

          <PrototypeGallery event={event} />
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main>
        <section className="section">
          <div className="container">
            <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-[0_30px_90px_rgba(6,40,70,0.1)]">
              <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                <img
                  alt=""
                  className="h-full min-h-[300px] w-full object-cover md:min-h-[420px]"
                  src={event.image}
                />
                <div className="grid content-center gap-5 p-6 md:p-8 lg:p-12">
                  <span className="w-fit rounded-full bg-[var(--primary-soft)] px-4 py-2 text-sm font-bold text-[var(--primary)]">
                    {event.eyebrow}
                  </span>
                  <h1 className="text-[var(--primary)]">{event.title}</h1>
                  <p className="text-base leading-8 text-[var(--muted)] md:text-lg">
                    {event.description}
                  </p>
                  <div className="grid gap-2 text-base text-[var(--primary)]">
                    <span>{event.date}</span>
                    <span>{event.location}</span>
                  </div>
                  {event.requiresRegistration && event.mode === "upcoming" && (
                    <Button className="w-fit text-white">S&apos;inscrire</Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container module-grid">
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
                <CardDescription>
                  Texte, videos et galerie dans une page plus editorialisee.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <p className="whitespace-pre-line text-base leading-8 text-[var(--primary)]">
                  {event.body}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {event.videos.map((src, index) => (
                    <iframe
                      allowFullScreen
                      className="aspect-video w-full rounded-2xl border border-[var(--border)]"
                      key={`${src}-${index}`}
                      src={src}
                      title={`${event.title} video ${index + 1}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            <PrototypeSide event={event} />
          </div>
        </section>

        <PrototypeGallery event={event} />
      </main>
    </PageShell>
  );
}

function PrototypeSide({ event }: { event: PrototypeEvent }) {
  return (
    <aside className="grid h-fit gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>{event.location}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-base text-[var(--muted)]">
          <p>{event.date}</p>
          <p>{event.registrations} participant(s)</p>
          {event.capacity && <p>Capacite : {event.capacity}</p>}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--subtle)] px-3 py-1">
              <Film className="size-4" />
              {event.videos.length} video(s)
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--subtle)] px-3 py-1">
              <Camera className="size-4" />
              {(event.mode === "past"
                ? event.afterGallery.length
                : event.gallery.length) || 0}{" "}
              photo(s)
            </span>
          </div>
        </CardContent>
      </Card>
    </aside>
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

function PrototypeGallery({ event }: { event: PrototypeEvent }) {
  const photos =
    event.mode === "past"
      ? [...event.gallery, ...event.afterGallery]
      : event.gallery;

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <h2>{event.mode === "past" ? "Galerie apres evenement" : "Apercu"}</h2>
          <p>
            Cette zone montre les photos utilisees pour raconter l&apos;evenement.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {photos.map((src, index) => (
            <img
              alt=""
              className={
                index === 0
                  ? "aspect-[4/3] rounded-2xl object-cover lg:col-span-2 lg:row-span-2 lg:h-full"
                  : "aspect-[4/3] rounded-2xl object-cover"
              }
              key={`${src}-${index}`}
              src={src}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
