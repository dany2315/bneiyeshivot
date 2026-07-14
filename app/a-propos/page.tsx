import Image from "next/image";
import Link from "next/link";
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
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "A propos",
  description:
    "Decouvrez l'histoire, la mission, les valeurs, l'equipe et les partenaires de Bnei Yeshivot.",
};

const missionPillars = [
  {
    title: "Accompagner",
    description:
      "Nous aidons les etudiants dans toutes leurs demarches administratives et pratiques.",
    Icon: HandHeart,
  },
  {
    title: "Former",
    description:
      "Nous organisons des programmes de Torah tout au long de l'annee.",
    Icon: GraduationCap,
  },
  {
    title: "Rassembler",
    description:
      "Nous creons une veritable communaute francophone grace a nos Chabbatot, evenements et activites.",
    Icon: Users,
  },
  {
    title: "Construire",
    description:
      "Nous accompagnons les jeunes de leur arrivee en Israel jusqu'a la construction de leur foyer.",
    Icon: Building2,
  },
];

const values: Array<{
  title: string;
  description: string;
  Icon: LucideIcon;
}> = [
  {
    title: "Torah",
    description:
      "Tout ce que nous faisons est guide par les valeurs de la Torah.",
    Icon: BookOpen,
  },
  {
    title: "Bienveillance",
    description:
      "Chaque jeune est accueilli avec attention, ecoute et respect.",
    Icon: HeartHandshake,
  },
  {
    title: "Excellence",
    description:
      "Nous cherchons a offrir un accompagnement organise et professionnel.",
    Icon: Star,
  },
  {
    title: "Responsabilite",
    description:
      "Nous prenons au serieux chaque demande qui nous est confiee.",
    Icon: ShieldCheck,
  },
  {
    title: "Unite",
    description:
      "Nous rassemblons les jeunes francophones autour d'un esprit de fraternite.",
    Icon: Users,
  },
];

const timeline = [
  "Creation de Bnei Yeshivot",
  "Developpement des services",
  "Lancement de Ben Hazmanim",
  "Creation de Talmoudo Beyado",
  "Organisation des grands Chabbatot",
  "Developpement des services administratifs",
  "Creation des guides d'installation",
  "Lancement de la boutique literie",
  "Developpement de Bayit Neeman",
  "Et les prochains projets",
];

const team = [
  {
    name: "Meir Guetta",
    role: "President - Fondateur",
    description:
      "Responsable de la vision, du developpement et de l'accompagnement des jeunes francophones.",
  },
  {
    name: "Responsable administratif",
    role: "Demarches et suivi",
    description:
      "Coordonne les demandes visa, assurance maladie et informations pratiques pour les etudiants.",
  },
  {
    name: "Responsable programmes",
    role: "Torah et evenements",
    description:
      "Organise les programmes, Chabbatot, cours et temps forts de l'annee.",
  },
];

const partners = [
  "Yechivot partenaires",
  "Associations",
  "Institutions",
  "Organismes administratifs",
  "Entreprises partenaires",
];

const faqs = [
  [
    "Qui peut beneficier de vos services ?",
    "Les etudiants, Bahourim, Avrekhim et jeunes francophones venant en Israel.",
  ],
  [
    "Les demarches sont-elles payantes ?",
    "Selon le service demande, certaines demarches sont gratuites tandis que d'autres peuvent comporter des frais administratifs clairement indiques.",
  ],
  [
    "Puis-je demander de l'aide avant mon arrivee ?",
    "Oui, nous accompagnons les etudiants avant meme leur depart.",
  ],
];

export default function AboutPage() {
  return (
    <PageShell>
      <main>
        <section className="about-hero">
          <Image
            src="https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1800&q=85"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="about-hero-overlay" />
          <div className="container about-hero-content">
            <span className="eyebrow">A propos de Bnei Yeshivot</span>
            <h1>Qui sommes-nous ?</h1>
            <p>
              Bnei Yeshivot est une association dediee a l'accompagnement des
              jeunes francophones qui viennent etudier en Israel. Notre mission
              est de leur offrir un cadre spirituel, humain et administratif
              afin qu'ils puissent se consacrer pleinement a leur developpement
              dans la Torah.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container about-story">
            <div>
              <span className="eyebrow">Notre histoire</span>
              <h2>Une reponse a un vrai besoin</h2>
              <p>
                Chaque annee, des centaines de jeunes francophones quittent la
                France, la Belgique, la Suisse ou d'autres pays pour venir
                etudier dans les Yechivot en Israel.
              </p>
              <p>
                Ils arrivent souvent seuls, sans connaitre les demarches
                administratives, sans reseau sur place et avec de nombreuses
                questions.
              </p>
            </div>
            <Card className="about-question-card">
              <CardHeader>
                <CardTitle>Les premieres questions</CardTitle>
                <CardDescription>
                  Visa, assurance maladie, literie, informations fiables et
                  soutien en cas de difficulte.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="about-check-list">
                  {[
                    "Comment obtenir un visa ?",
                    "Comment s'inscrire a une caisse d'assurance maladie ?",
                    "Ou acheter une literie ?",
                    "Comment trouver les bonnes informations ?",
                    "Vers qui se tourner en cas de difficulte ?",
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
          <div className="container">
            <div className="about-conviction">
              Aucun etudiant ne devrait vivre son arrivee en Israel seul.
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="eyebrow">Notre mission</span>
                <h2>Se concentrer sur l'essentiel : grandir dans la Torah</h2>
              </div>
              <p>
                Nous accompagnons chaque jeune avant son arrivee, pendant son
                sejour et tout au long de son parcours.
              </p>
            </div>
            <div className="grid grid-4">
              {missionPillars.map(({ title, description, Icon }) => (
                <Card className="about-icon-card" key={title}>
                  <CardHeader>
                    <span className="icon-box">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Nos valeurs</h2>
              <p>
                Des reperes clairs qui guident chaque service, chaque programme
                et chaque relation avec les jeunes.
              </p>
            </div>
            <div className="about-values-grid">
              {values.map(({ title, description, Icon }) => (
                <Card className="about-value-card" key={title}>
                  <CardHeader>
                    <span className="icon-box">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="section-header">
              <h2>Notre impact</h2>
              <p>
                Une progression construite annee apres annee autour des besoins
                concrets des jeunes francophones.
              </p>
            </div>
            <div className="about-timeline">
              {timeline.map((item, index) => (
                <div className="about-timeline-item" key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Notre equipe</h2>
              <p>
                Une equipe engagee pour inspirer confiance, repondre avec
                serieux et accompagner chaque jeune avec attention.
              </p>
            </div>
            <div className="grid grid-3">
              {team.map((member) => (
                <Card className="team-card" key={member.name}>
                  <div className="team-photo">
                    <Users className="size-10" />
                  </div>
                  <CardHeader>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="section-header">
              <h2>Nos partenaires</h2>
              <p>
                Les logos pourront etre affiches ici avec les organismes,
                institutions et entreprises qui travaillent avec Bnei Yeshivot.
              </p>
            </div>
            <div className="partner-grid">
              {partners.map((partner) => (
                <div className="partner-logo" key={partner}>
                  <Sparkles className="size-4" />
                  <span>{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Questions frequentes</h2>
              <p>
                Les reponses essentielles pour comprendre l'accompagnement Bnei
                Yeshivot.
              </p>
            </div>
            <div className="faq-list">
              {faqs.map(([question, answer]) => (
                <Card key={question}>
                  <CardHeader>
                    <CardTitle>{question}</CardTitle>
                    <CardDescription>{answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section about-final-cta">
          <div className="container about-final-cta-inner">
            <div>
              <span className="eyebrow">Vous preparez votre arrivee ?</span>
              <h2>Nous sommes la pour vous accompagner a chaque etape.</h2>
            </div>
            <div className="hero-actions">
              <Button asChild variant="accent" size="lg">
                <Link href="/services">Je fais une demande</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/contact">Je contacte un conseiller</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
