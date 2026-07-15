import Image from "next/image";
import Link from "next/link";
import { PageShell } from "../components";
import { AboutPartners } from "@/components/about-partners";
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
      "Nous accompagnons les jeunes francophones dans leurs demarches, leur integration en Israel et les grandes etapes de leur parcours.",
    Icon: HandHeart,
  },
  {
    title: "Former",
    description:
      "Nous construisons des cadres d'etude, de progression et de motivation autour de la Torah.",
    Icon: GraduationCap,
  },
  {
    title: "Rassembler",
    description:
      "Nous faisons vivre une communaute de Bahourim, Avrekhim, Rabbanim, familles et benevoles engages.",
    Icon: Users,
  },
  {
    title: "Construire",
    description:
      "Nous aidons chaque jeune a trouver sa place, depuis son arrivee jusqu'a la construction de son avenir.",
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
  "Torat Yaacov au Raincy",
  "Developpement de Bnei Alia",
  "Reseau Ben Hazmanim en France",
  "Beth Hamidrach Leil Shishi",
  "Creation de Talmoudo Beyado",
  "Binian Adei Ad",
  "Grand Maamad HaSiyoum",
  "Voyage de Rav Yehoshoua Eihenstein",
  "Rassemblement du 21 mars 2024",
  "Maison Bnei Yeshivot a Beit Vagan",
];

const team = [
  {
    name: "Meir Guetta",
    role: "President - Fondateur",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
    description:
      "Responsable de la vision, du developpement et de l'accompagnement des jeunes francophones.",
  },
  {
    name: "Responsable administratif",
    role: "Demarches et suivi",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80",
    description:
      "Coordonne les demandes visa, assurance maladie et informations pratiques pour les etudiants.",
  },
  {
    name: "Responsable programmes",
    role: "Torah et evenements",
    image:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
    description:
      "Organise les programmes, Chabbatot, cours et temps forts de l'annee.",
  },
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
              Bnei Yeshivot est une association dediee a l&apos;accompagnement des
              jeunes francophones dans leur parcours de Torah, leur integration
              en Israel et les grandes etapes de leur construction personnelle.
              Une vision nee du terrain, devenue un mouvement au service de
              toute une generation.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container about-story">
            <div>
              <span className="eyebrow">Notre histoire</span>
              <h2>Une reponse a un vrai besoin</h2>
              <p>
                L&apos;histoire commence au Raincy, avec la premiere Yechiva Ben
                Hazmanim Torat Yaacov, fondee pour l&apos;elevation de l&apos;ame de
                Rabbi Yaacov Toledano Zatsal.
              </p>
              <p>
                Quelques jeunes se retrouvaient pendant les vacances autour de
                l&apos;etude de la Torah. Tres vite, un besoin reel est apparu :
                offrir un cadre solide, motivant et adapte a une jeunesse qui
                voulait continuer a progresser.
              </p>
            </div>
            <Card className="about-question-card">
              <CardHeader>
                <CardTitle>De Torat Yaacov a Bnei Alia</CardTitle>
                <CardDescription>
                  L&apos;initiative du Raincy est devenue un reseau de Yechivot Ben
                  Hazmanim dans plusieurs villes de France.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="about-check-list">
                  {[
                    "Sdarim d'etude pendant les vacances",
                    "Encadrement par des Rabbanim et responsables",
                    "Atmosphere de Yechiva meme hors periode scolaire",
                    "Centaines de jeunes touches par le reseau",
                    "Une dynamique reconnue et encouragee",
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
              Lorsqu&apos;un jeune choisit de consacrer sa vie a la Torah, il doit
              trouver autour de lui un environnement capable de l&apos;accompagner.
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="about-mission-panel">
              <div className="about-mission-copy">
                <span className="eyebrow">Notre mission</span>
                <h2>Construire une maison autour de la Torah et de la jeunesse.</h2>
                <p>
                  Les projets naissent du terrain : besoins des jeunes, des
                  parents, des familles et des responsables de Yechivot. Bnei
                  Yeshivot transforme ces besoins en cadres concrets.
                </p>
              </div>
              <div className="about-mission-stack">
                {missionPillars.map(({ title, description, Icon }, index) => (
                  <div className="about-mission-row" key={title}>
                    <span className="about-mission-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon className="size-5" />
                    <div>
                      <strong>{title}</strong>
                      <p>{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="about-values-heading">
              <span className="eyebrow">Nos valeurs</span>
              <h2>Une maniere d&apos;agir, pas seulement des mots.</h2>
            </div>
            <div className="about-values-grid">
              {values.map(({ title, description, Icon }, index) => (
                <Card className="about-value-card" key={title}>
                  <CardHeader>
                    <span className="about-value-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="about-value-icon">
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
            <div className="about-impact-layout">
              <div>
                <span className="eyebrow">Notre impact</span>
                <h2>Des initiatives devenues des reperes pour une generation.</h2>
                <p>
                  Ben Hazmanim, Beth Hamidrach Leil Shishi, Talmoudo Beyado,
                  Binian Adei Ad et les grands rassemblements ont structure un
                  mouvement vivant autour de la Torah.
                </p>
              </div>
              <div className="about-impact-meter">
                <strong>10</strong>
                <span>axes developpes</span>
              </div>
            </div>
            <div className="about-impact-grid">
              {timeline.map((item, index) => (
                <div className="about-impact-item" key={item}>
                  <span>{index + 1}</span>
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
                    <Image
                      alt=""
                      fill
                      sizes="(max-width: 980px) 100vw, 33vw"
                      src={member.image}
                    />
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
          <div className="container about-story">
            <div>
              <span className="eyebrow">Le mot du fondateur</span>
              <h2>Une presence nee des besoins reels du terrain.</h2>
              <p>
                Bnei Yeshivot est nee d&apos;une rencontre avec les besoins reels
                des jeunes francophones. Depuis le debut, notre volonte est
                d&apos;etre presents, d&apos;ecouter la communaute et de construire des
                solutions concretes.
              </p>
              <p>
                Ce qui a commence avec quelques jeunes est devenu, avec l&apos;aide
                d&apos;Hachem, un mouvement reunissant jeunes, Avrekhim, Rabbanim et
                acteurs engages autour d&apos;une meme mission.
              </p>
            </div>
            <Card className="about-question-card">
              <CardHeader>
                <CardTitle>17 Rehov HaPisga</CardTitle>
                <CardDescription>
                  Beit Vagan, Jerusalem : une maison pour les jeunes
                  francophones et leurs familles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="about-check-list">
                  {[
                    "Accueil des jeunes et des familles",
                    "Beth Hamidrach Leil Shishi",
                    "Ecoute, conseil et orientation",
                    "Demandes administratives et accompagnement",
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

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Nos partenaires</h2>
              <p>
                Selectionnez une categorie pour afficher la liste des reseaux et
                structures qui travaillent avec Bnei Yeshivot.
              </p>
            </div>
            <AboutPartners />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Questions frequentes</h2>
              <p>
                Les reponses essentielles pour comprendre l&apos;accompagnement Bnei
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
