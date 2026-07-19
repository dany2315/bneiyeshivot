import Link from "next/link";
import Image from "next/image";
import { PageShell } from "../components";
import { ArrivalJourney } from "@/components/arrival-journey";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Compass,
  HeartHandshake,
  Luggage,
  Phone,
  Plane,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Je viens etudier en Israel",
  description:
    "Bnei Yeshivot accompagne les jeunes francophones avant leur depart, a leur arrivee et tout au long de leur parcours en Israel : guide, visa, assurance maladie, ETA-IL, installation et communaute.",
};

const heroPhotos = [
  {
    src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80",
    alt: "Depart a l'aeroport",
    className: "arrival-hero-photo-tall",
  },
  {
    src: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=900&q=80",
    alt: "Jerusalem et la vieille ville",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
    alt: "Etude a la yeshiva",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    alt: "Jeunes accompagnes par l'equipe Bnei Yeshivot",
    className: "arrival-hero-photo-wide",
  },
];

const introHighlights = [
  {
    icon: Compass,
    title: "Un chemin guide",
    text: "Chaque etape est balisee : vous savez toujours quelle est la prochaine action.",
  },
  {
    icon: Users,
    title: "Une equipe francophone",
    text: "Des personnes qui connaissent le terrain et votre langue, a chaque etape.",
  },
  {
    icon: Sparkles,
    title: "Une arrivee sereine",
    text: "Vous commencez votre nouvelle etape dans les meilleures conditions.",
  },
];

export default function VenirEtudierPage() {
  return (
    <PageShell>
      <main>
        {/* 1. HERO */}
        <section className="arrival-hero">
          <div className="container arrival-hero-inner">
            <div className="arrival-hero-copy">
              <span className="eyebrow">
                <Plane className="size-3.5" />
                Je viens etudier en Israel
              </span>
              <h1>Votre arrivee en Israel commence ici</h1>
              <p>
                Vous venez etudier en Israel ? Bnei Yeshivot vous accompagne
                avant votre depart, lors de votre arrivee et tout au long de
                votre parcours.
              </p>
              <div className="arrival-hero-actions">
                <Button asChild variant="accent" size="lg">
                  <a href="#parcours">
                    Commencer mon accompagnement
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="arrival-hero-secondary"
                >
                  <Link href="/contact">Nous contacter</Link>
                </Button>
              </div>
              <ul className="arrival-hero-chips">
                <li>
                  <Luggage className="size-4" />
                  Avant le depart
                </li>
                <li>
                  <Plane className="size-4" />A l&apos;arrivee
                </li>
                <li>
                  <HeartHandshake className="size-4" />
                  Tout au long du parcours
                </li>
              </ul>
            </div>

            <div className="arrival-hero-gallery" aria-hidden="true">
              {heroPhotos.map((photo) => (
                <div
                  key={photo.src}
                  className={`arrival-hero-photo ${photo.className}`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 980px) 50vw, 26vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Introduction */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Ne partez pas seul en Israel</h2>
              <p>
                Entre les demarches administratives, l&apos;installation et la
                recherche d&apos;un cadre adapte, beaucoup de questions peuvent
                se poser. Bnei Yeshivot accompagne les jeunes francophones pour
                arriver sereinement et bien commencer cette nouvelle etape.
              </p>
            </div>
            <div className="arrival-intro-grid">
              {introHighlights.map(({ icon: Icon, title, text }) => (
                <Card className="arrival-intro-card" key={title}>
                  <CardHeader className="gap-3">
                    <span className="arrival-intro-icon">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{text}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Mon parcours etape par etape (interactif) */}
        <section className="section band" id="parcours">
          <div className="container">
            <div className="section-header">
              <h2>Mon parcours etape par etape</h2>
              <p>
                Un chemin clair, de la preparation de votre depart jusqu&apos;a
                votre integration dans la communaute. Cochez chaque etape au fur
                et a mesure : votre progression est gardee en memoire sur cet
                appareil.
              </p>
            </div>

            <ArrivalJourney />
          </div>
        </section>

        {/* 4. Grand appel final */}
        <section className="section">
          <div className="container">
            <div className="arrival-final-cta">
              <span className="eyebrow">
                <Sparkles className="size-3.5" />
                Votre aventure commence
              </span>
              <h2>Pret pour votre aventure en Israel ?</h2>
              <p>
                Notre equipe est la pour vous accompagner a chaque etape, avant
                votre depart et tout au long de votre parcours.
              </p>
              <div className="arrival-final-actions">
                <Button asChild variant="accent" size="lg">
                  <a href="#parcours">
                    Commencer mon accompagnement
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild size="lg" className="arrival-final-contact">
                  <Link href="/contact">
                    <Phone className="size-4" />
                    Nous contacter
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
