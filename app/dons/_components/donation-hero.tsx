import { Play, ReceiptText, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DonationHero() {
  return (
    <section className="border-b border-[var(--border)] bg-white">
      <div className="container grid gap-10 py-14 lg:grid-cols-[1fr_440px] lg:items-center lg:py-20">
        <div className="max-w-3xl">
          <Badge variant="warning" className="mb-5 gap-2 px-3 py-2">
            <Sparkles className="size-4" />
            Soutenir Bnei Yeshivot
          </Badge>
          <h1 className="font-serif text-5xl leading-[0.95] font-bold text-[var(--primary-strong)] sm:text-6xl lg:text-7xl">
            Chaque don devient un accompagnement concret.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Aidez les jeunes francophones en Israel: demarches, Torah, entraide,
            evenements et suivi terrain. Don ponctuel ou mensuel, paiement
            securise par Stripe et recu Cerfa sur demande.
          </p>
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
              <a href="#don-form">Faire un don</a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="#impact">Voir l'impact</a>
            </Button>
          </div>
        </div>

        <a
          className="group relative grid aspect-video min-h-72 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--primary)] shadow-[0_28px_80px_rgba(6,40,70,0.16)] lg:aspect-[4/5]"
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
          <span className="relative m-auto grid size-20 place-items-center rounded-full border border-white/30 bg-gradient-to-br from-[var(--accent)] to-[var(--gold)] text-white shadow-2xl">
            <Play className="size-7" />
          </span>
        </a>
      </div>
    </section>
  );
}
