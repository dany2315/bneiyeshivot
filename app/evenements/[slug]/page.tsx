import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PageShell, StatusBadge } from "../../components";
import { registerForEvent } from "../actions";
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
import { Camera, Film } from "lucide-react";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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

  // Les evenements a venir n'ont pas de page dediee : tout est sur la card.
  if (!isPast) {
    redirect("/evenements");
  }

  const content = parseEventContent(event.content);
  const isRegistered = (event.registrations?.length ?? 0) > 0;
  const gallery = isPast
    ? [...content.gallery, ...content.pastPhotos]
    : content.gallery;
  const registrationsCount = event._count.registrations;

  return (
    <PageShell>
      <main>
        <section className="relative min-h-[620px] overflow-hidden text-white md:min-h-[72vh]">
          {event.imageKey ? (
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              src={event.imageKey}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#061e35] via-[#061e35]/55 to-transparent" />
          <div className="container relative z-10 flex min-h-[620px] items-end pb-10 pt-24 md:min-h-[72vh] md:pb-12">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-white">
                {isPast ? "Evenement passe" : "Evenement a venir"}
              </span>
              <h1 className="mt-5 text-white">{event.title}</h1>
              <p className="mt-4 text-lg leading-8 text-white/82 md:text-xl">
                {event.description}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <HeroStat label="Lieu" value={event.location || "A confirmer"} />
                <HeroStat
                  label="Participants"
                  value={`${registrationsCount}`}
                />
                <HeroStat
                  label="Medias"
                  value={`${content.videoUrls.length} video(s)`}
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link className="text-white" href="/evenements">
                    Retour aux evenements
                  </Link>
                </Button>
                {!isPast &&
                  event.requiresRegistration &&
                  (isRegistered ? (
                    <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white">
                      Deja inscrit
                    </span>
                  ) : (
                    <form action={registerForEvent}>
                      <input name="eventId" type="hidden" value={event.id} />
                      <input name="slug" type="hidden" value={event.slug} />
                      <Button type="submit" variant="secondary">
                        S&apos;inscrire
                      </Button>
                    </form>
                  ))}
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
                  <CardTitle>Participation</CardTitle>
                  <CardDescription>
                    {registrationsCount} inscription(s) enregistree(s).
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
                  <CardDescription>
                    {event.location || "Lieu a confirmer"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-base text-[var(--muted)]">
                  <p>Date : {formatDateTime(event.startsAt)}</p>
                  {event.endsAt && <p>Fin : {formatDateTime(event.endsAt)}</p>}
                  {event.capacity && <p>Capacite : {event.capacity}</p>}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--subtle)] px-3 py-1">
                      <Film className="size-4" />
                      {content.videoUrls.length} video(s)
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--subtle)] px-3 py-1">
                      <Camera className="size-4" />
                      {gallery.length} photo(s)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>

        {gallery.length > 0 && (
          <section className="section band">
            <div className="container">
              <div className="section-header">
                <h2>{isPast ? "Galerie apres evenement" : "Apercu"}</h2>
                <p>
                  Photos ajoutees par l&apos;equipe pour raconter
                  l&apos;evenement.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {gallery.map((src, index) => (
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
