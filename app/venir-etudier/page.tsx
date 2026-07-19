import Link from "next/link";
import Image from "next/image";
import { PageShell } from "../components";
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
  BedDouble,
  CheckCircle2,
  Compass,
  Globe,
  HeartHandshake,
  HeartPulse,
  Luggage,
  MessageCircle,
  Phone,
  Plane,
  Sparkles,
  Stamp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Je viens etudier en Israel",
  description:
    "Bnei Yeshivot accompagne les jeunes francophones avant leur depart, a leur arrivee et tout au long de leur parcours en Israel : guide, visa, assurance maladie, ETA-IL, installation et communaute.",
};

// TODO: remplacer par le lien du groupe WhatsApp de l'association.
const WHATSAPP_URL = "https://chat.whatsapp.com/";

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

type JourneyStep = {
  step: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets?: string[];
  cta: { label: string; href: string; external?: boolean };
  icon: LucideIcon;
};

const journeySteps: JourneyStep[] = [
  {
    step: "01",
    eyebrow: "Avant mon depart",
    title: "Je prepare mon arrivee",
    description:
      "Nous vous aidons a preparer votre arrivee sereinement, bien avant de monter dans l'avion.",
    bullets: [
      "Notre guide complet d'installation en Israel.",
      "Les informations pratiques essentielles.",
      "La checklist des choses importantes.",
      "Les conseils pour organiser votre depart.",
    ],
    cta: { label: "Telecharger le guide d'arrivee", href: "/guide" },
    icon: Luggage,
  },
  {
    step: "02",
    eyebrow: "Mon visa etudiant",
    title: "Je prepare mon visa",
    description:
      "Nous vous accompagnons dans vos demarches de visa etudiant afin de faciliter votre arrivee en Israel.",
    bullets: [
      "Comprendre les demarches.",
      "Preparer les documents.",
      "Deposer votre demande.",
      "Suivre votre dossier.",
    ],
    cta: { label: "Faire ma demande de visa", href: "/demandes/visa" },
    icon: Stamp,
  },
  {
    step: "03",
    eyebrow: "Mon assurance maladie",
    title: "Je prepare ma couverture sante",
    description:
      "Nous vous accompagnons pour effectuer votre inscription aupres des caisses d'assurance maladie israeliennes.",
    cta: {
      label: "Faire ma demande d'assurance maladie",
      href: "/demandes/koupat-holim",
    },
    icon: HeartPulse,
  },
  {
    step: "04",
    eyebrow: "Mon autorisation ETA-IL",
    title: "Je prepare mon entree en Israel",
    description:
      "Nous vous aidons a comprendre et effectuer votre demande ETA-IL lorsque celle-ci est necessaire.",
    cta: {
      label: "Faire ma demande ETA-IL",
      href: "https://israel-entry.piba.gov.il/",
      external: true,
    },
    icon: Globe,
  },
  {
    step: "05",
    eyebrow: "Mon installation",
    title: "J'arrive avec tout le necessaire",
    description:
      "Pour faciliter votre installation, Bnei Yeshivot propose des solutions pratiques des votre arrivee.",
    bullets: [
      "Literie et kit d'installation.",
      "Informations utiles.",
      "Conseils pratiques.",
      "Contacts importants.",
    ],
    cta: { label: "Preparer mon installation", href: "/boutique" },
    icon: BedDouble,
  },
  {
    step: "06",
    eyebrow: "Rejoindre la communaute",
    title: "Une fois arrive, vous n'etes pas seul",
    description:
      "Apres votre arrivee, vous pouvez rejoindre nos differents programmes et retrouver un cadre chaleureux.",
    bullets: [
      "Beth Hamidrach.",
      "Talmoudo Beyado.",
      "Ben Hazmanim.",
      "Shabbatot, Leil Chichi et evenements.",
    ],
    cta: { label: "Decouvrir nos programmes", href: "/programme" },
    icon: HeartHandshake,
  },
  {
    step: "07",
    eyebrow: "Rester connecte",
    title: "Recevez toutes les informations utiles",
    description:
      "Rejoignez notre groupe WhatsApp pour recevoir les prochains evenements et rester en lien avec l'equipe.",
    bullets: ["Groupe WhatsApp de l'association.", "Prochains evenements."],
    cta: { label: "Rejoindre WhatsApp", href: WHATSAPP_URL, external: true },
    icon: MessageCircle,
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

function StepCta({ cta }: { cta: JourneyStep["cta"] }) {
  if (cta.external) {
    return (
      <Button asChild variant="accent" className="w-full sm:w-auto">
        <a href={cta.href} target="_blank" rel="noreferrer">
          {cta.label}
          <ArrowRight className="size-4" />
        </a>
      </Button>
    );
  }

  return (
    <Button asChild variant="accent" className="w-full sm:w-auto">
      <Link href={cta.href}>
        {cta.label}
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
}

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

        {/* 3. Mon parcours etape par etape */}
        <section className="section band" id="parcours">
          <div className="container">
            <div className="section-header">
              <h2>Mon parcours etape par etape</h2>
              <p>
                Un chemin clair, de la preparation de votre depart jusqu&apos;a
                votre integration dans la communaute. Suivez les etapes une a
                une, a votre rythme.
              </p>
            </div>

            <ol className="arrival-journey">
              {journeySteps.map(({ step, eyebrow, title, description, bullets, cta, icon: Icon }) => (
                <li className="arrival-step" key={step}>
                  <div className="arrival-step-rail">
                    <span className="arrival-step-number">{step}</span>
                  </div>
                  <Card className="arrival-step-card">
                    <CardHeader className="gap-3">
                      <div className="arrival-step-head">
                        <span className="arrival-step-icon">
                          <Icon className="size-5" />
                        </span>
                        <span className="arrival-step-eyebrow">{eyebrow}</span>
                      </div>
                      <CardTitle>{title}</CardTitle>
                      <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-5">
                      {bullets ? (
                        <ul className="arrival-step-bullets">
                          {bullets.map((bullet) => (
                            <li key={bullet}>
                              <CheckCircle2 className="size-4" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <StepCta cta={cta} />
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
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
