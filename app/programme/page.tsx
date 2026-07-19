import Image from "next/image";
import Link from "next/link";
import { PageShell } from "../components";
import { programmes } from "./programmes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Programmes",
  description:
    "Programmes Bnei Yeshivot pour faire grandir la jeunesse francophone dans la Torah.",
};

export default function ProgrammePage() {
  return (
    <PageShell>
      <main>
        <section className="programme-hero">
          <Image
            src="/programmes-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="programme-hero-overlay" />
          <div className="container programme-hero-content programme-hero-grid">
            <div className="programme-hero-copy">
              <span className="eyebrow">Nos programmes</span>
              <h1>Faire grandir la jeunesse francophone dans la Torah</h1>
              <p>
                Tout au long de l&apos;annee, Bnei Yeshivot propose des cadres
                d&apos;etude, des rencontres, des Chabbatot et un accompagnement
                adapte aux jeunes francophones en Israel.
              </p>
              <div className="hero-actions">
                <Button asChild variant="accent" size="lg">
                  <Link href="#programmes">Decouvrir nos programmes</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/contact">Participer</Link>
                </Button>
              </div>
            </div>

            <div className="programme-hero-panel" aria-label="Apercu des programmes">
              <div className="programme-hero-panel-row">
                <span>
                  <BookOpen className="size-5" />
                </span>
                <div>
                  <strong>Etude</strong>
                  <small>Beth Hamidrach, Talmoudo Beyado</small>
                </div>
              </div>
              <div className="programme-hero-panel-row">
                <span>
                  <Users className="size-5" />
                </span>
                <div>
                  <strong>Rassemblement</strong>
                  <small>Chabbatot et Ben Hazmanim</small>
                </div>
              </div>
              <div className="programme-hero-panel-row">
                <span>
                  <CalendarDays className="size-5" />
                </span>
                <div>
                  <strong>Accompagnement</strong>
                  <small>Binian Adei Ad, Chidoukhim</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container split">
            <div>
              <span className="eyebrow">Introduction</span>
              <h2>Une communaute qui accompagne chaque etape</h2>
              <p>
                Arriver en Israel est une grande etape dans la vie d&apos;un jeune.
                Au-dela des demarches administratives, il est essentiel de
                trouver un cadre, une communaute et des moments qui permettent
                de grandir dans la Torah.
              </p>
              <p>
                C&apos;est pourquoi Bnei Yeshivot developpe differents programmes
                pour accompagner les jeunes avant leur arrivee, pendant leur
                sejour et dans leur construction personnelle.
              </p>
            </div>
            <Card className="program-highlight-card">
              <CardHeader>
                <CardTitle>Etude, rencontres et accompagnement</CardTitle>
                <CardDescription>
                  Des cadres penses pour que chaque jeune puisse trouver sa
                  place, avancer dans son limoud et rester relie a une
                  communaute vivante.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="about-check-list">
                  {[
                    "Des cadres d'etude reguliers",
                    "Des rencontres avec des Rabbanim",
                    "Des Chabbatot et moments de rassemblement",
                    "Un accompagnement dans les etapes importantes",
                  ].map((item) => (
                    <li key={item}>
                      <CheckCircle2 className="size-4" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="section band" id="programmes">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="eyebrow">Nos grands programmes</span>
                <h2>Des cadres pour etudier, grandir et construire</h2>
              </div>
              <p>
                Chaque programme repond a un besoin concret du parcours
                d&apos;un jeune francophone : approfondir son etude, etre entoure
                de Rabbanim, vivre des experiences marquantes, developper des
                liens durables et trouver sa place au sein d&apos;une communaute
                engagee.
              </p>
            </div>

            <div className="program-list-grid">
              {programmes.map(
                ({
                  title,
                  eyebrow,
                  description,
                  longDescription,
                  focusLabel,
                  ctaLabel,
                  image,
                  href,
                  slug,
                  actions,
                  stats,
                }, index) => (
                  <Card
                    className="program-list-card"
                    data-featured={index === 0 ? "true" : undefined}
                    key={title}
                  >
                    <div className="program-card-media">
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes={
                          index === 0
                            ? "(max-width: 980px) 100vw, 45vw"
                            : "(max-width: 980px) 100vw, 36vw"
                        }
                      />
                    </div>
                    <CardHeader className="program-card-header">
                      <div className="program-list-topline">
                        <span className="program-kicker">{eyebrow}</span>
                      </div>
                      <CardTitle className="program-card-title">
                        {title}
                      </CardTitle>
                      <CardDescription className="program-card-description">
                        {description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="program-card-body">
                      <p className="program-card-copy">{longDescription}</p>
                      <strong className="program-focus-label">
                        {focusLabel}
                      </strong>
                      <ul className="program-card-list">
                        {actions.slice(0, 5).map((action) => (
                          <li key={action.title}>
                            <CheckCircle2 className="size-4" />
                            <span>{action.title}</span>
                          </li>
                        ))}
                      </ul>
                      {stats?.length ? (
                        <div className="program-card-stats">
                          {stats.map((stat) => (
                            <div key={`${stat.value}-${stat.label}`}>
                              <strong>{stat.value}</strong>
                              <span>{stat.label}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {slug === "talmoudo-beyado" ? (
                        <div className="flex flex-wrap gap-3">
                          <Button asChild variant="accent">
                            <Link href="/programme/talmoudo-beyado#inscription-talmoudo">
                              M&apos;inscrire au mivhan
                              <ArrowRight className="size-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="secondary">
                            <Link href={href}>Decouvrir</Link>
                          </Button>
                        </div>
                      ) : (
                        <Button asChild variant="secondary">
                          <Link href={href}>
                            {ctaLabel}
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="section about-final-cta">
          <div className="container about-final-cta-inner">
            <div>
              <span className="eyebrow">Rejoignez une communaute</span>
              <h2>Que vous soyez deja en Israel ou en preparation de votre arrivee, Bnei Yeshivot est la pour vous accompagner.</h2>
            </div>
            <div className="hero-actions">
              <Button asChild variant="accent" size="lg">
                <Link href="/contact">Participer a un programme</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/contact">Nous contacter</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
