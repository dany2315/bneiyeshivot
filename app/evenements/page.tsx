import Link from "next/link";
import { prototypeEvents, type PrototypeEvent } from "@/lib/event-prototypes";
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
import { ArrowRight, Camera, Film, MapPin, Users } from "lucide-react";

export const metadata = {
  title: "Evenements",
};

export default function EventsPage() {
  const upcoming = prototypeEvents.filter((event) => event.mode === "upcoming");
  const past = prototypeEvents.filter((event) => event.mode === "past");

  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Prototypes visuels</span>
            <h1>Evenements</h1>
            <p>
              Test de presentation des cards et des pages detail avant de fixer
              le design definitif branche a la base de donnees.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Evenements a venir</h2>
              <p>Trois propositions de cards pour les evenements futurs.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((event) => (
                <PrototypeCard event={event} key={event.slug} />
              ))}
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="section-header">
              <h2>Evenements passes</h2>
              <p>Trois propositions de cards pour les souvenirs et galeries.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {past.map((event) => (
                <PrototypeCard event={event} key={event.slug} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function PrototypeCard({ event }: { event: PrototypeEvent }) {
  if (event.cardVariant === 1) {
    return (
      <Card className="overflow-hidden border-[var(--border)] bg-white shadow-[0_20px_70px_rgba(6,40,70,0.08)]">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img alt="" className="h-full w-full object-cover" src={event.image} />
          <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
            <StatusBadge tone={event.mode === "past" ? "gold" : "blue"}>
              {event.mode === "past" ? "Passe" : "A venir"}
            </StatusBadge>
            {event.requiresRegistration && <Badge variant="success">Inscription</Badge>}
          </div>
        </div>
        <CardHeader className="min-h-[178px]">
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" />
              {event.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-4" />
              {event.registrations}
            </span>
          </div>
          <Button asChild className="w-full sm:w-fit">
            <Link className="text-white" href={`/evenements/${event.slug}`}>
              Voir le design
              <ArrowRight />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (event.cardVariant === 2) {
    return (
      <Card className="relative min-h-[430px] overflow-hidden border-0 bg-[var(--primary)] text-white shadow-[0_24px_80px_rgba(6,40,70,0.18)]">
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          src={event.image}
        />
        <CardHeader className="relative min-h-[280px] justify-end">
          <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
            {event.eyebrow}
          </span>
          <CardTitle className="text-3xl text-white">{event.title}</CardTitle>
          <CardDescription className="text-white/78">
            {event.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div className="grid gap-1 text-sm text-white/80">
            <span>{event.date}</span>
            <span>{event.location}</span>
          </div>
          <Button asChild className="w-full sm:w-fit" variant="secondary">
            <Link href={`/evenements/${event.slug}`}>Ouvrir</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--border)] bg-white shadow-[0_18px_60px_rgba(6,40,70,0.06)]">
      <CardHeader className="min-h-[185px]">
        <div className="flex items-center justify-between gap-3">
          <StatusBadge tone={event.mode === "past" ? "gold" : "blue"}>
            {event.eyebrow}
          </StatusBadge>
          <span className="text-sm font-bold text-[var(--accent)]">
            Design {event.cardVariant}
          </span>
        </div>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-3 gap-2">
          {[event.image, ...event.gallery.slice(0, 2)].map((src, index) => (
            <img
              alt=""
              className={index === 0 ? "col-span-2 aspect-[2/1] rounded-xl object-cover" : "aspect-square rounded-xl object-cover"}
              key={`${src}-${index}`}
              src={src}
            />
          ))}
        </div>
        <div className="grid gap-2 text-sm text-[var(--muted)]">
          <span className="inline-flex items-center gap-2">
            <Film className="size-4" />
            {event.videos.length} video(s)
          </span>
          <span className="inline-flex items-center gap-2">
            <Camera className="size-4" />
            {event.mode === "past"
              ? event.afterGallery.length
              : event.gallery.length} photo(s)
          </span>
        </div>
        <Button asChild className="w-full sm:w-fit" variant="secondary">
          <Link href={`/evenements/${event.slug}`}>Comparer la page</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
