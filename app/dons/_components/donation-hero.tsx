import {
  BookOpenText,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  Play,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const heroImpact = [
  { icon: GraduationCap, label: "Collelim", value: "22 avrekhim" },
  { icon: BookOpenText, label: "Leachlim", value: "150 participants" },
  { icon: UsersRound, label: "Ben Hazmanim", value: "150 jeunes" },
  { icon: CalendarDays, label: "Lel Chichi", value: "Jerusalem" },
];

export function DonationHero() {
  return (
    <section className="border-b border-[var(--border)] bg-white">
      <div className="container grid gap-8 py-10 sm:gap-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:py-20">
        <div className="max-w-3xl">
          <Badge variant="warning" className="mb-5 gap-2 px-3 py-2">
            <Sparkles className="size-4" />
            Grace a vous
          </Badge>
          <h1 className="font-serif text-4xl leading-[1.03] font-bold text-[var(--primary-strong)] sm:text-6xl sm:leading-[0.98] lg:text-7xl">
            Aidez-nous a faire perdurer ce magnifique projet !
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] sm:mt-6 sm:text-lg sm:leading-8">
            Votre participation fait vivre les collelim, les programmes d'etude,
            les Yechivot Ben Hazmanim, le Beth Hamidrach Lel Chichi et les
            soirees de hizouk en France et en Israel.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {heroImpact.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--subtle)]/70 p-3"
                  key={item.label}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-sm text-[var(--primary)]">
                      {item.label}
                    </strong>
                    <small className="text-[var(--muted)]">{item.value}</small>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Badge variant="info" className="gap-2 px-3 py-2">
              <ShieldCheck className="size-4" />
              Paiement Stripe securise
            </Badge>
            <Badge variant="success" className="gap-2 px-3 py-2">
              <ReceiptText className="size-4" />
              Cerfa rattache au don
            </Badge>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#don-form">Je participe</a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="#impact">Voir ce que vous soutenez</a>
            </Button>
          </div>
        </div>

        <a
          className="group relative grid aspect-video min-h-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--primary)] shadow-[0_20px_50px_rgba(6,40,70,0.14)] sm:min-h-72 sm:rounded-2xl lg:aspect-[4/5] lg:shadow-[0_28px_80px_rgba(6,40,70,0.16)]"
          href="https://www.youtube.com/@bneiyeshivot"
          rel="noreferrer"
          target="_blank"
        >
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-300 group-hover:scale-105"
            src="/about-hero.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#031729]/70 via-[#031729]/20 to-transparent" />
          <span className="relative m-auto grid size-16 place-items-center rounded-full border border-white/30 bg-gradient-to-br from-[var(--accent)] to-[var(--gold)] text-white shadow-2xl sm:size-20">
            <Play className="size-6 sm:size-7" />
          </span>
          <span className="absolute right-4 bottom-4 left-4 rounded-xl bg-white/92 p-4 text-sm font-bold text-[var(--primary)] shadow-lg">
            <HeartHandshake className="mr-2 inline size-4 text-[var(--accent)]" />
            Chaque don devient un accompagnement concret.
          </span>
        </a>
      </div>
    </section>
  );
}
