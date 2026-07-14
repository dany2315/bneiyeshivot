import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatDateTime, parseEventContent } from "@/lib/event-content";
import { fileUrl } from "@/lib/files";
import { registerForEvent } from "./actions";
import { PageShell, StatusBadge } from "../components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";

export const metadata = {
  title: "Evenements",
};

export default async function EventsPage() {
  const now = new Date();
  const user = await getCurrentUser();
  const events = await prisma.event.findMany({
    include: {
      registrations: user
        ? { where: { userId: user.id }, take: 1 }
        : false,
    },
    orderBy: { startsAt: "asc" },
  });

  const upcoming = events.filter((event) => event.startsAt >= now);
  // Un evenement passe n'apparait qu'une fois publie par l'admin (texte + medias).
  const past = events
    .filter(
      (event) =>
        event.startsAt < now &&
        parseEventContent(event.content).pastPublished,
    )
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());

  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Communaute Bnei Yeshivot</span>
            <h1>Evenements</h1>
            <p>
              Retrouvez les prochains rendez-vous ouverts a la communaute et les
              souvenirs des evenements passes.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Evenements a venir</h2>
              <p>Les prochains rendez-vous de la communaute.</p>
            </div>
            {upcoming.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {upcoming.map((event) => (
                  <UpcomingCard
                    event={event}
                    isRegistered={(event.registrations?.length ?? 0) > 0}
                    key={event.id}
                    loggedIn={Boolean(user)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="Aucun evenement a venir pour le moment." />
            )}
          </div>
        </section>

        {past.length > 0 && (
          <section className="section band">
            <div className="container">
              <div className="section-header">
                <h2>Evenements passes</h2>
                <p>Photos, videos et souvenirs des rencontres precedentes.</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {past.map((event) => (
                  <PastCard event={event} key={event.id} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </PageShell>
  );
}

type EventWithMeta = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageKey: string | null;
  location: string | null;
  startsAt: Date;
  capacity: number | null;
  requiresRegistration: boolean;
  content: unknown;
};

function EventImage({
  imageKey,
  badge,
}: {
  imageKey: string | null;
  badge: React.ReactNode;
}) {
  const src = fileUrl(imageKey);

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--primary-soft)]">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="h-full w-full object-cover"
          src={src}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white">
          <CalendarDays className="size-10 opacity-80" />
        </div>
      )}
      <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
        {badge}
      </div>
    </div>
  );
}

function EventMeta({ event }: { event: EventWithMeta }) {
  return (
    <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
      <span className="inline-flex items-center gap-1">
        <CalendarDays className="size-4" />
        {formatDateTime(event.startsAt)}
      </span>
      <span className="inline-flex items-center gap-1">
        <MapPin className="size-4" />
        {event.location || "Lieu a confirmer"}
      </span>
      {event.capacity != null && (
        <span className="inline-flex items-center gap-1">
          <Users className="size-4" />
          {event.capacity} participants
        </span>
      )}
    </div>
  );
}

function UpcomingCard({
  event,
  isRegistered,
  loggedIn,
}: {
  event: EventWithMeta;
  isRegistered: boolean;
  loggedIn: boolean;
}) {
  return (
    <Card className="group overflow-hidden border-[var(--border)] bg-white pt-0 shadow-[0_20px_70px_rgba(6,40,70,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(6,40,70,0.12)]">
      <EventImage
        badge={
          <>
            <StatusBadge tone="blue">A venir</StatusBadge>
            {event.requiresRegistration && (
              <Badge variant="success">Inscription</Badge>
            )}
          </>
        }
        imageKey={event.imageKey}
      />
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <EventMeta event={event} />
        {event.requiresRegistration ? (
          isRegistered ? (
            <StatusBadge tone="green">Deja inscrit</StatusBadge>
          ) : (
            <form action={registerForEvent}>
              <input name="eventId" type="hidden" value={event.id} />
              <input name="slug" type="hidden" value={event.slug} />
              <Button className="w-full text-white sm:w-fit" type="submit">
                S&apos;inscrire
                <ArrowRight />
              </Button>
              {!loggedIn && (
                <span className="mt-2 block text-sm text-[var(--muted)] ">
                  Connexion a l&apos;Espace Bahour demandee avant
                  l&apos;inscription.
                </span>
              )}
            </form>
          )
        ) : (
          <Button asChild variant="secondary">
            <Link href="/contact">
              Contactez-nous
              <ArrowRight />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function PastCard({ event }: { event: EventWithMeta }) {
  return (
    <Card className="overflow-hidden border-[var(--border)] bg-white shadow-[0_20px_70px_rgba(6,40,70,0.08)] pt-0">
      <EventImage
        badge={<StatusBadge tone="gold">Passe</StatusBadge>}
        imageKey={event.imageKey}
      />
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <EventMeta event={event} />
        <Button asChild className="w-full sm:w-fit">
          <Link className="text-white" href={`/evenements/${event.slug}`}>
            Voir les photos
            <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="border-dashed bg-white/60">
      <CardContent className="flex items-center justify-center py-14 text-center text-base text-[var(--muted)]">
        {message}
      </CardContent>
    </Card>
  );
}
