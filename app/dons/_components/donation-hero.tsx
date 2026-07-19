import type { ReactNode } from "react";
import Image from "next/image";
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

export function DonationHero({ children }: { children: ReactNode }) {
  return (
    <section className="bg-white">
      <div className="container py-6 sm:py-8 lg:py-10">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,0.86fr)_minmax(430px,0.9fr)] lg:items-start">
          <div className="grid gap-5">
            <div>
              <Badge variant="warning" className="mb-4 gap-2 px-3 py-2">
                <Sparkles className="size-4" />
                Grace a vous
              </Badge>
              <h1 className="max-w-2xl font-serif text-3xl leading-[1.03] font-bold text-[var(--primary-strong)] sm:text-5xl sm:leading-[0.98] lg:text-6xl">
                Aidez-nous a faire perdurer ce magnifique projet !
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
                Votre participation fait vivre les collelim, les programmes
                d&apos;etude, les Yechivot Ben Hazmanim et les soirees de hizouk.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="h-11 px-6 text-base">
                <a href="#don-form">Je participe</a>
              </Button>
              <Button
                asChild
                className="h-11 px-6 text-base"
                variant="secondary"
                size="lg"
              >
                <a href="#don-projects">Voir ce que vous soutenez</a>
              </Button>
            </div>

          <a
            className="group relative grid aspect-video overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--primary)] shadow-[0_16px_34px_rgba(6,40,70,0.12)]"
            href="https://www.youtube.com/@bneiyeshivot"
            rel="noreferrer"
            target="_blank"
          >
            <Image
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-300 group-hover:scale-105"
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              src="/about-hero.jpg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#031729]/70 via-[#031729]/20 to-transparent" />
            <span className="relative m-auto grid size-16 place-items-center rounded-full border border-white/30 bg-gradient-to-br from-[var(--accent)] to-[var(--gold)] text-white shadow-2xl sm:size-20">
              <Play className="size-6 sm:size-7" />
            </span>
            <span className="absolute right-3 bottom-3 left-3 rounded-lg bg-white/92 p-3 text-sm font-bold text-[var(--primary)] shadow-lg">
              <HeartHandshake className="mr-2 inline size-4 text-[var(--accent)]" />
              Chaque don devient un accompagnement concret.
            </span>
          </a>

          <div className="grid gap-2 sm:grid-cols-2" id="don-projects">
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

          <div className="flex flex-wrap gap-3">
            <Badge variant="info" className="gap-2 px-3 py-2">
              <ShieldCheck className="size-4" />
              Paiement securise
            </Badge>
            <Badge variant="success" className="gap-2 px-3 py-2">
              <ReceiptText className="size-4" />
              Cerfa rattache au don
            </Badge>
          </div>
          </div>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}
