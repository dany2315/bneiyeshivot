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
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1800&q=86"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="programme-hero-overlay" />
          <div className="container programme-hero-content programme-hero-grid">
            <div className="programme-hero-copy">
              <span className="eyebrow">NOS PROGRAMMES</span>
              <h1>Une génération. Une vision. Une communauté.</h1>
              <p>
                Les plus grandes réalisations commencent toujours par une
                vision. Chez Bnei Yeshivot, cette vision est de permettre à
                chaque jeune francophone de trouver bien plus qu&apos;un simple
                programme : un véritable cadre de vie, de Torah et
                d&apos;accompagnement.
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
                  <strong>Étude</strong>
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
                  <small>Bayit Neeman, Chidoukhim</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container split">
            <div>
              <span className="eyebrow">Notre vision</span>
              <h2>Chaque jeune mérite bien plus qu&apos;une simple activité.</h2>
              <p>
                Il mérite un cadre d&apos;étude solide, des repères, des Rabbanim,
                une communauté engagée et un accompagnement qui lui permette de
                grandir durablement dans la Torah et de construire son avenir
                avec sérénité.
              </p>
              <p>
                C&apos;est cette vision qui guide Bnei Yeshivot depuis sa création.
                Aujourd&apos;hui, grâce à un réseau de Kehilot, de Yéchivot, de
                Rabbanim et de partenaires en France et en Israël, nous
                développons des programmes qui accompagnent les Bahourim, les
                Avrékhim et les familles à chaque étape de leur parcours.
              </p>
              <p>
                Du Beth Hamidrach aux Yéchivot Ben Hazmanim, des Chabbatot aux
                Mivhanim de Talmoudo Beyado, des actions de solidarité à la
                préparation du futur foyer, chaque initiative répond à un besoin
                concret et s&apos;inscrit dans une même ambition : faire grandir une
                génération profondément attachée à la Torah et construire
                l&apos;avenir de la communauté francophone.
              </p>
            </div>
            <Card className="program-highlight-card">
              <CardHeader>
                <CardTitle>Une vision concrète</CardTitle>
                <CardDescription>
                  Un cadre de vie, de Torah et d&apos;accompagnement pour aider
                  chaque jeune à grandir durablement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="about-check-list">
                  {[
                    "Cadres d'étude solides",
                    "Repères et Rabbanim",
                    "Communauté engagée",
                    "Accompagnement durable",
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
                <h2>Des cadres pour étudier, grandir et construire</h2>
              </div>
              <p>
                Chaque programme répond à un besoin concret du parcours d&apos;un
                jeune francophone : approfondir son étude, être entouré de
                Rabbanim, vivre des expériences marquantes, développer des liens
                durables et trouver sa place au sein d&apos;une communauté engagée.
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
                  Icon,
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
                        <span className="icon-box">
                          <Icon className="size-5" />
                        </span>
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
                      <Button asChild variant="secondary">
                        <Link href={href}>
                          {ctaLabel}
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
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
              <span className="eyebrow">Rejoignez une communauté</span>
              <h2>Que vous soyez déjà en Israël ou en preparation de votre arrivée, Bnei Yeshivot est la pour vous accompagner.</h2>
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
