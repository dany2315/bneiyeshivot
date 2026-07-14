import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../components";
import { getProgram, programmes } from "../programmes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";

type ProgramDetail = {
  heroText: string;
  primaryCta: string;
  intro: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    bullets?: string[];
  };
  featureTitle: string;
  featureDescription: string;
  features: Array<{
    title: string;
    description: string;
  }>;
  flow?: string[];
  audience?: string[];
  values?: Array<{
    title: string;
    description: string;
  }>;
  practical?: Array<{
    label: string;
    value: string;
  }>;
  gallery?: string[];
  testimonials?: string[];
  formFields?: string[];
  secondaryHref?: string;
  secondaryCta?: string;
};

const programDetails: Record<string, ProgramDetail> = {
  "beth-hamidrach": {
    heroText:
      "Chaque jeudi soir, Bnei Yeshivot accueille les jeunes francophones autour d'un programme qui associe etude de la Torah, Vaad, sujets pratiques et moment de convivialite.",
    primaryCta: "Je m'inscris au Beth Hamidrach",
    intro: {
      eyebrow: "Notre vision",
      title: "Faire vivre une Torah concrete au quotidien",
      paragraphs: [
        "Arriver en Israel represente une etape importante dans la vie d'un jeune.",
        "Au-dela de l'etude quotidienne en Yechiva, il est essentiel de pouvoir retrouver un cadre, une communaute et des moments permettant de renforcer son lien avec la Torah.",
      ],
      bullets: [
        "Offrir un rendez-vous regulier aux jeunes francophones",
        "Creer un espace d'etude et de reflexion",
        "Permettre des echanges avec des Rabbanim et des intervenants",
        "Approfondir des sujets essentiels de la vie juive",
        "Construire une veritable communaute",
      ],
    },
    featureTitle: "Le programme du moment",
    featureDescription:
      "Chaque semaine, un nouveau sujet est aborde a travers des sources, un Vaad, une partie pratique et un repas convivial.",
    features: [
      {
        title: "Etude approfondie",
        description:
          "Decouverte des sources, comprehension des notions fondamentales et etude des textes.",
      },
      {
        title: "Vaad",
        description:
          "Un moment de reflexion, d'explication et d'echange autour du theme etudie.",
      },
      {
        title: "Partie pratique",
        description:
          "Des demonstrations et mises en situation pour comprendre l'application concrete de la Halakha.",
      },
      {
        title: "Repas et convivialite",
        description:
          "Un moment de partage dans une ambiance chaleureuse entre jeunes francophones.",
      },
    ],
    flow: [
      "Etude autour du theme de la semaine",
      "Vaad avec un intervenant",
      "Demonstration ou partie pratique",
      "Repas et moment d'echange entre jeunes",
    ],
    audience: [
      "Bahourim francophones etudiant en Israel",
      "Jeunes inscrits dans des Yechivot",
      "Etudiants souhaitant renforcer leurs connaissances en Torah",
      "Jeunes qui recherchent un cadre regulier et une communaute",
    ],
    values: [
      {
        title: "Torah",
        description: "Mettre l'etude et la comprehension de la Torah au centre.",
      },
      {
        title: "Fraternite",
        description:
          "Creer des liens forts entre jeunes francophones venus etudier en Israel.",
      },
      {
        title: "Progression",
        description: "Permettre a chacun d'avancer dans son parcours personnel.",
      },
      {
        title: "Application",
        description:
          "Comprendre comment les enseignements de la Torah s'integrent dans la vie quotidienne.",
      },
    ],
    practical: [
      { label: "Lieu", value: "17 Rehov HaPisga, Bayit Vagan - Jerusalem" },
      { label: "Jour", value: "Chaque jeudi soir" },
      { label: "Horaire", value: "A completer" },
    ],
    gallery: [
      "Soirees d'etude",
      "Vaadim",
      "Demonstrations pratiques",
      "Repas",
      "Participants",
    ],
    testimonials: ["Bahourim participants", "Rabbanim", "Intervenants"],
    formFields: [
      "Nom",
      "Prenom",
      "Age",
      "Telephone",
      "Email",
      "Yechiva",
      "Ville d'origine",
      "Message eventuel",
    ],
  },
  "ben-hazmanim": {
    heroText:
      "Les vacances deviennent une nouvelle opportunite de progresser dans un cadre adapte, motivant et enrichissant.",
    primaryCta: "Voir les prochains programmes",
    intro: {
      eyebrow: "Notre vision",
      title: "Garder une dynamique de Torah pendant les vacances",
      paragraphs: [
        "Les vacances ne doivent pas representer une rupture avec la Torah, mais une opportunite de progresser autrement.",
      ],
      bullets: [
        "Maintenir un rythme d'etude",
        "Continuer a progresser dans un cadre motivant",
        "Rencontrer d'autres jeunes partageant les memes valeurs",
        "Profiter d'une ambiance de Torah et de fraternite",
      ],
    },
    featureTitle: "Un reseau de programmes en France et en Israel",
    featureDescription:
      "Bnei Yeshivot developpe un reseau de Yechivot Ben Hazmanim pour permettre a chaque Bahour de trouver un cadre proche, adapte et motivant.",
    features: [
      {
        title: "En France",
        description:
          "Des programmes organises dans plusieurs villes de Paris et de sa region avec des communautes locales.",
      },
      {
        title: "En Israel",
        description:
          "Des cadres notamment a Jerusalem pour accompagner les jeunes presents en Israel pendant les vacances.",
      },
      {
        title: "Dynamique communautaire",
        description:
          "Une collaboration avec des Kehilot, Yechivot et acteurs de terrain.",
      },
      {
        title: "Plus de 250 participants",
        description:
          "Les dernieres editions ont reuni des Bahourim, Avrekhim et etudiants en France et en Israel.",
      },
    ],
    audience: [
      "Bahourim francophones etudiant en Yechiva",
      "Jeunes souhaitant garder un cadre de Torah pendant les vacances",
      "Etudiants recherchant une experience enrichissante avec d'autres jeunes",
    ],
    values: [
      { title: "Torah", description: "Maintenir un lien fort avec l'etude." },
      { title: "Fraternite", description: "Creer des liens entre jeunes francophones." },
      { title: "Motivation", description: "Donner une dynamique positive pour continuer a avancer." },
      { title: "Accompagnement", description: "Permettre a chacun de trouver sa place." },
    ],
    gallery: [
      "Etudes",
      "Sederim",
      "Moments de partage",
      "Activites",
      "Participants",
      "Communautes partenaires",
    ],
    testimonials: [
      "Bahourim participants",
      "Rabbanim",
      "Responsables communautaires",
    ],
  },
  shabbatot: {
    heroText:
      "Des moments privilegies pour se retrouver autour de la Torah, de la convivialite et d'une ambiance chaleureuse.",
    primaryCta: "Voir les Shabbatot",
    intro: {
      eyebrow: "Notre vision",
      title: "Creer des moments qui marquent les parcours",
      paragraphs: [
        "L'annee d'un jeune etudiant en Israel est rythmee par l'etude et la vie en Yechiva.",
        "Les Shabbatot Bnei Yeshivot offrent un moment different pour sortir du cadre quotidien et construire une vraie communaute.",
      ],
      bullets: [
        "Rencontrer d'autres jeunes francophones",
        "Renforcer son lien avec la Torah",
        "Partager des moments de qualite",
        "Creer une veritable communaute",
      ],
    },
    featureTitle: "Un Chabbat autour de la Torah et de la fraternite",
    featureDescription:
      "Chaque Chabbat rassemble cours, repas, rencontres et moments de partage dans un esprit chaleureux.",
    features: [
      {
        title: "Temps de Torah",
        description: "Cours, divrei Torah, etudes et rencontres avec des Rabbanim.",
      },
      {
        title: "Rencontres",
        description: "Moments de discussion et creation de liens entre jeunes.",
      },
      {
        title: "Repas de Chabbat",
        description: "Des repas organises dans une ambiance conviviale.",
      },
      {
        title: "Ambiance communautaire",
        description: "Un esprit de fraternite ou chacun trouve sa place.",
      },
    ],
    audience: [
      "Bahourim francophones",
      "Etudiants en Israel",
      "Jeunes souhaitant partager un moment de Torah et de communaute",
      "Familles et participants souhaitant rejoindre une dynamique francophone",
    ],
    gallery: [
      "Repas de Chabbat",
      "Etudes",
      "Interventions",
      "Participants",
      "Moments de convivialite",
    ],
    testimonials: ["Jeunes", "Familles", "Rabbanim"],
  },
  "talmoudo-beyado": {
    heroText:
      "Un programme pour donner aux Bahourim les outils de progresser dans leur etude avec regularite, objectifs et encouragement.",
    primaryCta: "Je rejoins Talmoudo Beyado",
    intro: {
      eyebrow: "Notre vision",
      title: "Transformer l'etude en un objectif concret",
      paragraphs: [
        "Beaucoup de Bahourim etudient avec serieux, mais il est parfois difficile de garder un rythme regulier, de fixer des objectifs et de mesurer ses progres.",
      ],
      bullets: [
        "Fixer des objectifs d'etude",
        "Approfondir ses connaissances",
        "Reviser regulierement",
        "Evaluer sa progression",
        "Etre encourage dans son parcours",
      ],
    },
    featureTitle: "Comment fonctionne le programme ?",
    featureDescription:
      "Un parcours base sur l'etude, la revision, les mivhanim et un suivi motivant.",
    features: [
      {
        title: "Etude quotidienne",
        description:
          "Les participants poursuivent leur etude en Yechiva avec un objectif personnel de progression.",
      },
      {
        title: "Revisions regulieres",
        description:
          "Un travail de revision consolide les connaissances acquises.",
      },
      {
        title: "Mivhanim mensuels",
        description:
          "Des examens reguliers permettent d'evaluer la maitrise du sujet etudie.",
      },
      {
        title: "Bourse d'encouragement",
        description:
          "Une reconnaissance du travail accompli pour soutenir la motivation.",
      },
    ],
    practical: [
      {
        label: "Contenu",
        value: "8 dapim de Guemara avec Rachi et Tosfot",
      },
      {
        label: "Organisation",
        value: "Les jeudis des Chabbatot Hofesh",
      },
      {
        label: "Dates",
        value: "Communiquees environ une semaine a l'avance",
      },
    ],
    audience: [
      "Bahourim de Yechiva Guedola en Israel",
      "Jeunes francophones etudiant dans une Yechiva en Israel",
    ],
    values: [
      { title: "Etudier", description: "Donner une nouvelle dimension au limoud." },
      { title: "Reviser", description: "Consolider ce qui a ete appris." },
      { title: "Reussir", description: "Avancer avec des objectifs mesurables." },
      { title: "Continuer", description: "Garder une dynamique de progression." },
    ],
    gallery: [
      "Mivhanim",
      "Participants",
      "Remises de bourses",
      "Rencontres",
      "Rabbanim presents",
    ],
    testimonials: [
      "Bahourim participants",
      "Rabbanim",
      "Responsables de Yechivot",
    ],
    formFields: [
      "Nom",
      "Prenom",
      "Age",
      "Yechiva",
      "Telephone",
      "Email",
      "Massekhet etudiee actuellement",
    ],
  },
  "bayit-neeman": {
    heroText:
      "Un accompagnement serieux et professionnel pour aider les jeunes a construire un foyer base sur les valeurs de la Torah.",
    primaryCta: "Parler avec un conseiller",
    secondaryHref: "https://binianadeiad.com",
    secondaryCta: "Creer mon profil Chidoukh",
    intro: {
      eyebrow: "Binian Adei Ad",
      title: "Accompagner les jeunes dans la construction de leur futur foyer",
      paragraphs: [
        "Construire un foyer base sur les valeurs de la Torah est une etape essentielle dans la vie d'un jeune.",
        "Notre accompagnement repose sur deux axes complementaires : favoriser des rencontres adaptees grace au reseau de Chidoukhim et accompagner les jeunes avant, pendant et apres cette etape importante.",
      ],
    },
    featureTitle: "Chidoukhim et accompagnement au mariage",
    featureDescription:
      "Une demarche construite avec discretion, ecoute, Rabbanim et personnes competentes.",
    features: [
      {
        title: "Plateforme dediee",
        description:
          "Chaque participant peut creer un profil complet pour presenter son parcours, ses valeurs et son projet de vie.",
      },
      {
        title: "Reseau de Shadkhanim",
        description:
          "Des personnes de confiance et des professionnels etudient les profils et proposent des rencontres adaptees.",
      },
      {
        title: "Avant le mariage",
        description:
          "Soirees de preparation, conferences, conseils pratiques et interventions de Rabbanim.",
      },
      {
        title: "Apres le mariage",
        description:
          "Cours d'Adraha, conseils de Hashkafa, Halakhot essentielles et accompagnement des premieres etapes.",
      },
    ],
    audience: [
      "Jeunes en recherche de Chidoukh",
      "Jeunes fiances souhaitant etre accompagnes",
      "Jeunes couples au debut de leur construction",
    ],
    values: [
      { title: "Ecoute", description: "Comprendre chaque parcours avec attention." },
      { title: "Discretion", description: "Respecter la sensibilite de chaque demarche." },
      { title: "Confiance", description: "Travailler avec des personnes fiables." },
      { title: "Torah", description: "Construire un foyer avec des reperes solides." },
    ],
  },
  chidoukhim: {
    heroText:
      "Un accompagnement base sur l'ecoute, la discretion et la confiance pour aider les jeunes a avancer dans leur recherche.",
    primaryCta: "Creer mon profil Chidoukh",
    secondaryHref: "https://binianadeiad.com",
    secondaryCta: "Acceder a Binian Adei Ad",
    intro: {
      eyebrow: "Chidoukhim",
      title: "Des rencontres serieuses et adaptees",
      paragraphs: [
        "La recherche du bon conjoint est une etape importante qui necessite ecoute, reflexion et accompagnement.",
        "Bnei Yeshivot developpe ce service en collaboration avec des personnes de confiance et des professionnels du domaine.",
      ],
      bullets: [
        "Creation d'un profil personnel",
        "Etude des parcours et valeurs recherchees",
        "Propositions adaptees",
        "Accompagnement des demarches",
      ],
    },
    featureTitle: "Un travail en reseau",
    featureDescription:
      "L'accompagnement se construit avec des Shadkhanim, Yechivot, seminaires, communautes et responsables educatifs.",
    features: [
      {
        title: "Profil complet",
        description:
          "Informations personnelles, parcours, etudes, projet de vie et attentes concernant le futur conjoint.",
      },
      {
        title: "Shadkhanim de qualite",
        description:
          "Des personnes de confiance qui partagent une meme vision et une meme exigence.",
      },
      {
        title: "Collaboration",
        description:
          "Des liens avec les etablissements et communautes pour mieux comprendre les parcours.",
      },
    ],
    values: [
      { title: "Serieux", description: "Une demarche reflechie et encadree." },
      { title: "Discretion", description: "Une attention particuliere a la confidentialite." },
      { title: "Confiance", description: "Des propositions adaptees et responsables." },
    ],
  },
  avrekhim: {
    heroText:
      "Des cadres de Torah et une dynamique communautaire pour accompagner les Avrekhim francophones installes en Israel.",
    primaryCta: "Decouvrir le Programme Avrekhim",
    intro: {
      eyebrow: "Programme Avrekhim",
      title: "Accompagner les Avrekhim dans leur etude et leur vie quotidienne",
      paragraphs: [
        "Bnei Yeshivot developpe des cadres de Torah et une dynamique communautaire pour permettre aux Avrekhim de continuer leur etude dans un environnement serieux, chaleureux et adapte.",
      ],
    },
    featureTitle: "Les cadres du programme",
    featureDescription:
      "Deux kollelim et une communaute d'Avrekhim francophones autour de l'etude, du partage et de la solidarite.",
    features: [
      {
        title: "Kollel Erev Zikhron Eliyahou",
        description:
          "Un cadre d'etude regulier a Jerusalem qui rassemble actuellement 12 Avrekhim.",
      },
      {
        title: "Kollel Chichi Ohel Yaacov",
        description:
          "Un rendez-vous hebdomadaire autour de la Torah qui rassemble actuellement 10 Avrekhim.",
      },
      {
        title: "Communaute d'Avrekhim",
        description:
          "Renforcer la solidarite, les rencontres, l'entraide et la vie communautaire.",
      },
      {
        title: "Lien avec Kesher Nitsri",
        description:
          "Les actions de solidarite sont soutenues par la communaute Kesher Nitsri.",
      },
    ],
    values: [
      { title: "Etude", description: "Renforcer l'etude quotidienne." },
      { title: "Dynamique", description: "Creer un lien durable entre Avrekhim." },
      { title: "Familles", description: "Renforcer les liens entre familles francophones." },
      { title: "Solidarite", description: "Developper une communaute attentive aux besoins." },
    ],
    secondaryHref: "/kesher-nitsri",
    secondaryCta: "Voir Kesher Nitsri",
  },
};

type ProgramDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return programmes.map((program) => ({
    slug: program.slug,
  }));
}

export async function generateMetadata({ params }: ProgramDetailPageProps) {
  const { slug } = await params;
  const program = getProgram(slug);

  if (!program) {
    return {
      title: "Programme",
    };
  }

  return {
    title: program.title,
    description: program.description,
  };
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { slug } = await params;
  const program = getProgram(slug);

  if (!program) {
    notFound();
  }

  const {
    title,
    eyebrow,
    description,
    longDescription,
    ctaLabel,
    image,
    Icon,
  } = program;
  const detail = programDetails[slug];

  if (!detail) {
    notFound();
  }

  const primaryCta = detail.primaryCta || ctaLabel;

  return (
    <PageShell>
      <main>
        <section className="program-detail-visual-hero">
          <Image src={image} alt="" fill priority sizes="100vw" />
          <div className="program-detail-hero-overlay" />
          <div className="container program-detail-hero-grid">
            <div className="program-detail-hero-copy">
              <Link className="program-back-link" href="/programme">
                <ArrowLeft className="size-4" />
                Tous les programmes
              </Link>
              <span className="eyebrow">{eyebrow}</span>
              <h1>{title}</h1>
              <p>{detail.heroText || description}</p>
              <div className="hero-actions">
                <Button asChild variant="accent" size="lg">
                  <Link href="/contact">
                    <MessageCircle className="size-5" />
                    {primaryCta}
                  </Link>
                </Button>
                {detail.secondaryHref && detail.secondaryCta ? (
                  <Button asChild variant="secondary" size="lg">
                    <Link href={detail.secondaryHref}>{detail.secondaryCta}</Link>
                  </Button>
                ) : null}
              </div>
            </div>

            <Card className="program-detail-hero-card">
              <CardHeader>
                <span className="icon-box">
                  <Icon className="size-5" />
                </span>
                <CardTitle>{description}</CardTitle>
                <CardDescription>{longDescription}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="section">
          <div className="container program-detail-intro">
            <div className="program-detail-intro-copy">
              <span className="eyebrow">{detail.intro.eyebrow}</span>
              <h2>{detail.intro.title}</h2>
              {detail.intro.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {detail.intro.bullets?.length ? (
              <Card className="program-detail-list-card">
                <CardHeader>
                  <CardTitle>Ce que cela apporte</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="program-detail-check-list">
                    {detail.intro.bullets.map((item) => (
                      <li key={item}>
                        <CheckCircle2 className="size-4" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <Card className="program-detail-list-card">
                <CardHeader>
                  <CardTitle>{eyebrow}</CardTitle>
                  <CardDescription>{longDescription}</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="section-header">
              <h2>{detail.featureTitle}</h2>
              <p>{detail.featureDescription}</p>
            </div>
            <div className="program-detail-feature-grid">
              {detail.features.map((feature, index) => (
                <Card className="program-detail-feature-card" key={feature.title}>
                  <CardHeader>
                    <span className="program-detail-feature-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {detail.flow?.length ? (
          <section className="section">
            <div className="container">
              <div className="section-header">
                <h2>Le deroulement</h2>
                <p>Une progression simple, claire et chaleureuse.</p>
              </div>
              <div className="program-detail-flow">
                {detail.flow.map((step, index) => (
                  <div className="program-detail-flow-step" key={step}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className={detail.flow?.length ? "section band" : "section"}>
          <div className="container program-detail-two-column">
            {detail.audience?.length ? (
              <Card className="program-detail-panel">
                <CardHeader>
                  <span className="icon-box">
                    <Users className="size-5" />
                  </span>
                  <CardTitle>Pour qui ?</CardTitle>
                  <CardDescription>
                    Le programme s&apos;adresse aux jeunes qui souhaitent avancer
                    dans un cadre serieux, humain et adapte.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="program-detail-check-list">
                    {detail.audience.map((item) => (
                      <li key={item}>
                        <CheckCircle2 className="size-4" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {detail.practical?.length ? (
              <Card className="program-detail-panel">
                <CardHeader>
                  <span className="icon-box">
                    <MapPin className="size-5" />
                  </span>
                  <CardTitle>Informations pratiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="program-detail-info-list">
                    {detail.practical.map((item) => (
                      <div key={item.label}>
                        <small>{item.label}</small>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {detail.values?.length ? (
              <Card className="program-detail-panel">
                <CardHeader>
                  <span className="icon-box">
                    <HeartHandshake className="size-5" />
                  </span>
                  <CardTitle>Les valeurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="program-detail-values">
                    {detail.values.map((value) => (
                      <div key={value.title}>
                        <strong>{value.title}</strong>
                        <p>{value.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>

        {(detail.gallery?.length || detail.testimonials?.length || detail.formFields?.length) ? (
          <section className="section">
            <div className="container">
              <div className="program-detail-resource-grid">
                {detail.gallery?.length ? (
                  <Card className="program-detail-resource-card">
                    <CardHeader>
                      <span className="icon-box">
                        <Sparkles className="size-5" />
                      </span>
                      <CardTitle>Galerie</CardTitle>
                      <CardDescription>
                        Photos et videos pour montrer l&apos;ambiance du programme.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="program-detail-chip-list">
                        {detail.gallery.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : null}

                {detail.testimonials?.length ? (
                  <Card className="program-detail-resource-card">
                    <CardHeader>
                      <span className="icon-box">
                        <MessageCircle className="size-5" />
                      </span>
                      <CardTitle>Temoignages</CardTitle>
                      <CardDescription>
                        Des retours de ceux qui vivent le programme.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="program-detail-chip-list">
                        {detail.testimonials.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : null}

                {detail.formFields?.length ? (
                  <Card className="program-detail-resource-card">
                    <CardHeader>
                      <span className="icon-box">
                        <FileText className="size-5" />
                      </span>
                      <CardTitle>Inscription</CardTitle>
                      <CardDescription>
                        Le formulaire permettra de transmettre les informations
                        utiles a l&apos;equipe.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="program-detail-chip-list">
                        {detail.formFields.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <section className="section about-final-cta">
          <div className="container about-final-cta-inner">
            <div>
              <span className="eyebrow">Rejoindre le programme</span>
              <h2>Notre equipe peut vous accompagner dans la prochaine etape.</h2>
            </div>
            <div className="hero-actions">
              <Button asChild variant="accent" size="lg">
                <Link href="/contact">{primaryCta}</Link>
              </Button>
              {detail.secondaryHref && detail.secondaryCta ? (
                <Button asChild variant="secondary" size="lg">
                  <Link href={detail.secondaryHref}>{detail.secondaryCta}</Link>
                </Button>
              ) : (
                <Button asChild variant="secondary" size="lg">
                  <Link href="/programme">Voir les autres programmes</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
