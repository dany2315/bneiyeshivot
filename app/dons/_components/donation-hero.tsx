import { Play, ReceiptText, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DonationHero() {
  return (
    <section className="border-b border-[var(--border)] bg-white">
      <div className="container grid gap-8 py-10 sm:gap-10 sm:py-14 lg:grid-cols-[1fr_440px] lg:items-center lg:py-20">
        <div className="max-w-3xl">
          <Badge variant="warning" className="mb-5 gap-2 px-3 py-2">
            <Sparkles className="size-4" />
            Soutenir Bnei Yeshivot
          </Badge>
          <h1 className="font-serif text-4xl leading-[1.03] font-bold text-[var(--primary-strong)] sm:text-6xl sm:leading-[0.98] lg:text-7xl">
            Chaque don devient un accompagnement concret.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] sm:mt-6 sm:text-lg sm:leading-8">
            Aidez les jeunes francophones en Israel: demarches, Torah, entraide,
            evenements et suivi terrain. Don ponctuel ou mensuel, paiement
            securise par Stripe et recu Cerfa automatique.
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
        </a>
      </div>
    </section>
  );
}
