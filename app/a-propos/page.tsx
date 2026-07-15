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

const storyChapters = [
  {
    title: "Une histoire nee d'un besoin reel",
    text:
      "L'histoire de Bnei Yeshivot commence au Raincy, avec la premiere Yechiva Ben Hazmanim Torat Yaacov. A l'origine, quelques jeunes se retrouvaient pendant les vacances autour de l'etude de la Torah, avec la volonte de creer un vrai cadre de Yechiva meme hors periode scolaire.",
  },
  {
    title: "De Torat Yaacov a Bnei Alia",
    text:
      "L'experience du Raincy s'est developpee dans plusieurs villes de France pour devenir Bnei Alia, un reseau de Yechivot Ben Hazmanim. Ce cadre permet a de nombreux Bahourim de retrouver des Sdarim d'etude, un encadrement et une ambiance de Torah pendant les periodes de vacances.",
  },
  {
    title: "Beth Hamidrach Leil Shishi",
    text:
      "Avec le developpement des programmes, un nouveau besoin est apparu : creer un lieu permanent ou les jeunes francophones peuvent se retrouver toute l'annee autour de l'etude, des cours, des Vaadim, des sujets pratiques et de moments de cohesion.",
  },
  {
    title: "Talmoudo Beyado",
    text:
      "Face au besoin exprime par les parents et les responsables de Yechivot, Bnei Yeshivot a cree Talmoudo Beyado : un programme d'objectifs, d'examens mensuels et de suivi pour renforcer l'assiduite, la motivation et l'excellence dans le Limoud.",
  },
  {
    title: "Binian Adei Ad",
    text:
      "Parce que l'accompagnement ne s'arrete pas aux annees de Yechiva, Bnei Yeshivot a developpe Binian Adei Ad, un projet dedie a l'accompagnement dans la construction du foyer et les demarches de Chidoukhim, avec des personnes de confiance.",
  },
  {
    title: "Une maison a Beit Vagan",
    text:
      "Aujourd'hui, les locaux du 17 Rehov HaPisga a Beit Vagan sont devenus une maison pour les jeunes francophones : accueil des jeunes et des familles, Beth Hamidrach Leil Shishi, demandes d'accompagnement, ecoute, conseil et orientation.",
  },
];

const landmarkEvents = [
  {
    title: "Le Grand Maamad HaSiyoum",
    description:
      "Un rassemblement de 500 jeunes Bahourim autour d'un Siyoum sur la Massekhet etudiee dans leurs Yechivot, signe fort de Kavod HaTorah et d'investissement dans l'etude.",
  },
  {
    title: "Le voyage de Rav Yehoshoua Eihenstein Shlita",
    description:
      "Un voyage historique en France pour visiter institutions et communautes, transmettre des enseignements autour du Hinouh et reunir Rabbanim, Roshei Yechivot et centaines de Bahourim.",
  },
  {
    title: "Le 21 mars 2024 a Beit Vagan",
    description:
      "Un rassemblement historique de 500 jeunes Bahourim francophones etudiant en Israel, marque par la presence de grands Rabbanim et Roshei Yechivot, et devenu un tournant pour le mouvement.",
  },
];

const communityForces = [
  "Des dizaines d'Avrekhim impliques dans les differents cadres",
  "Des dizaines de Bahourim engages dans les projets",
  "Des Rabbanim qui accompagnent et soutiennent les initiatives",
  "Une equipe de responsables et de benevoles mobilises quotidiennement",
  "Des familles, donateurs et partenaires qui permettent de developper de nouveaux projets",
];

const futureVision = [
  "Developper des structures fortes pour les prochaines generations",
  "Accompagner chaque jeune francophone dans son parcours de Torah",
  "Faciliter l'integration en Israel avec des reperes clairs",
  "Soutenir la construction personnelle, familiale et spirituelle",
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
            <div className="section-header">
              <h2>Notre histoire en detail</h2>
              <p>
                Une vision nee du terrain, construite et developpee au fil des
                besoins reels de la jeunesse francophone.
              </p>
            </div>
            <div className="about-longform-grid">
              {storyChapters.map((chapter, index) => (
                <Card className="about-longform-card" key={chapter.title}>
                  <CardHeader>
                    <span className="about-value-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <CardTitle>{chapter.title}</CardTitle>
                    <CardDescription>{chapter.text}</CardDescription>
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
          <div className="container about-story">
            <div>
              <span className="eyebrow">Evenements marquants</span>
              <h2>Des moments qui ont rassemble une generation.</h2>
              <p>
                Au fil de son developpement, Bnei Yeshivot a organise des
                rassemblements majeurs qui ont donne une expression visible a
                la force de la jeunesse francophone autour de la Torah.
              </p>
            </div>
            <div className="about-event-stack">
              {landmarkEvents.map((event) => (
                <Card className="about-question-card" key={event.title}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container about-story">
            <div>
              <span className="eyebrow">Un mouvement humain</span>
              <h2>Une communaute engagee qui porte les projets.</h2>
              <p>
                Le developpement de Bnei Yeshivot repose sur une force humaine :
                jeunes, Avrekhim, Rabbanim, familles, donateurs, partenaires et
                benevoles qui croient dans la mission.
              </p>
            </div>
            <Card className="about-question-card">
              <CardHeader>
                <CardTitle>Ce qui rend le mouvement possible</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="about-check-list">
                  {communityForces.map((item) => (
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
              <p className="about-founder-name">
                Meir Guetta - Fondateur et President de Bnei Yeshivot
              </p>
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
          <div className="container about-vision-panel">
            <div>
              <span className="eyebrow">Notre vision pour demain</span>
              <h2>Continuer a ecrire l&apos;histoire avec la prochaine generation.</h2>
              <p>
                Ce qui est ne d&apos;une petite initiative est devenu une dynamique
                majeure au service de milliers de jeunes et de familles. Notre
                ambition est de continuer a construire les cadres necessaires
                pour accompagner chaque jeune francophone.
              </p>
            </div>
            <div className="about-vision-list">
              {futureVision.map((item) => (
                <div key={item}>
                  <CheckCircle2 className="size-4" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <strong className="about-vision-signature">
              Une generation. Une mission. Une vision.
            </strong>
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
