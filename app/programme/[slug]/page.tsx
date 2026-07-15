import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../components";
import { getProgram, programmes } from "../programmes";
import { Button } from "@/components/ui/button";
import { BenHazmanimFranceMap } from "@/components/ben-hazmanim-france-map";
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
      "Chaque jeudi soir, Bnei Yeshivot accueille les jeunes francophones autour d'un programme qui associe étude de la Torah, Vaad, sujets pratiques et moment de convivialite.",
    primaryCta: "Je m'inscris au Beth Hamidrach",
    intro: {
      eyebrow: "Notre vision",
      title: "Faire vivre une Torah concrète au quotidien",
      paragraphs: [
        "Arriver en Israël represente une étape importante dans la vie d'un jeune.",
        "Au-delà de l'étude quotidienne en Yechiva, il est essentiel de pouvoir retrouver un cadre, une communauté et des moments permettant de renforcer son lien avec la Torah.",
      ],
      bullets: [
        "Offrir un rendez-vous régulier aux jeunes francophones",
        "Créer un espace d'étude et de réflexion",
        "Permettre des échanges avec des Rabbanim et des intervenants",
        "Approfondir des sujets essentiels de la vie juive",
        "Construire une véritable communauté",
      ],
    },
    featureTitle: "Le programme du moment",
    featureDescription:
      "Chaque semaine, un nouveau sujet est aborde à travers des sources, un Vaad, une partie pratique et un repas convivial.",
    features: [
      {
        title: "Étude approfondie",
        description:
          "Decouverte des sources, compréhension des notions fondamentales et étude des textes.",
      },
      {
        title: "Vaad",
        description:
          "Un moment de réflexion, d'explication et d'échange autour du thème étudié.",
      },
      {
        title: "Partie pratique",
        description:
          "Des démonstrations et mises en situation pour comprendre l'application concrète de la Halakha.",
      },
      {
        title: "Repas et convivialite",
        description:
          "Un moment de partage dans une ambiance chaleureuse entre jeunes francophones.",
      },
    ],
    flow: [
      "Étude autour du thème de la semaine",
      "Vaad avec un intervenant",
      "Demonstration ou partie pratique",
      "Repas et moment d'échange entre jeunes",
    ],
    audience: [
      "Bahourim francophones étudiant en Israël",
      "Jeunes inscrits dans des Yechivot",
      "Étudiants souhaitant renforcer leurs connaissances en Torah",
      "Jeunes qui recherchent un cadre régulier et une communauté",
    ],
    values: [
      {
        title: "Torah",
        description: "Mettre l'étude et la compréhension de la Torah au centre.",
      },
      {
        title: "Fraternité",
        description:
          "Créer des liens forts entre jeunes francophones venus étudier en Israël.",
      },
      {
        title: "Progression",
        description: "Permettre à chacun d'avancer dans son parcours personnel.",
      },
      {
        title: "Application",
        description:
          "Comprendre comment les enseignements de la Torah s'intègrent dans la vie quotidienne.",
      },
    ],
    practical: [
      { label: "Lieu", value: "17 Rehov HaPisga, Bayit Vagan - Jérusalem" },
      { label: "Jour", value: "Chaque jeudi soir" },
      { label: "Horaire", value: "À compléter" },
    ],
    gallery: [
      "Soirées d'étude",
      "Vaadim",
      "Démonstrations pratiques",
      "Repas",
      "Participants",
    ],
    testimonials: ["Bahourim participants", "Rabbanim", "Intervenants"],
    formFields: [
      "Nom",
      "Prénom",
      "Age",
      "Téléphone",
      "Email",
      "Yechiva",
      "Ville d'origine",
      "Message eventuel",
    ],
  },
  "ben-hazmanim": {
    heroText:
      "Le plus grand réseau francophone de Yéchivot Ben Hazmanim en France et en Israël.",
    primaryCta: "Voir les prochains programmes",
    intro: {
      eyebrow: "Ben Hazmanim",
      title: "Un véritable mouvement de Torah pendant les vacances",
      paragraphs: [
        "Chaque période de Ben Hazmanim représente un défi : comment permettre à des centaines de Bahourim francophones de continuer à vivre un véritable rythme de Torah, même pendant les vacances ?",
        "Pour répondre à ce besoin, Bnei Yeshivot a développé, au fil des années, un réseau structuré de Yéchivot Ben Hazmanim qui rassemble aujourd'hui des centaines de jeunes à travers la France et Israël.",
        "Bien plus qu'un simple programme de vacances, Ben Hazmanim est devenu un véritable mouvement de Torah, porté par des Rabbanim, des responsables de Kehilot et des équipes locales qui partagent une même ambition : permettre à chaque Bahour de continuer à grandir dans la Torah, où qu'il se trouve.",
        "Aujourd'hui, notre réseau est présent notamment en France au Raincy, à Épinay-sur-Seine, Paris 19, Sarcelles, Centre Alef, Bonneuil-sur-Marne, Clichy-sous-Bois, Aix-les-Bains, Marseille et Strasbourg, ainsi qu'en Israël à Jérusalem - Kiryat Yovel.",
        "Grâce à la collaboration de nombreuses Kehilot, Rabbanim et responsables locaux, plusieurs centres d'étude fonctionnent simultanément pendant Ben Hazmanim, offrant un cadre sérieux, vivant et adapté aux besoins des Bahourim.",
        "Aujourd'hui, ce sont plus de 300 Bahourim qui participent à nos différents programmes, faisant de Ben Hazmanim l'un des plus importants réseaux francophones de Torah pendant les vacances.",
      ],
      bullets: [
        "Le Raincy",
        "Épinay-sur-Seine",
        "Paris 19",
        "Sarcelles",
        "Centre Alef",
        "Bonneuil-sur-Marne",
        "Clichy-sous-Bois",
        "Aix-les-Bains",
        "Marseille",
        "Strasbourg",
        "Jérusalem - Kiryat Yovel",
      ],
    },
    featureTitle: "Une force collective au service de la Torah",
    featureDescription:
      "Ben Hazmanim, ce n'est pas seulement des lieux d'étude. C'est un réseau vivant qui relie des dizaines de Rabbanim, de responsables de Kehilot et des centaines de Bahourim autour d'un même objectif : faire en sorte que les vacances deviennent un temps de progression dans la Torah.",
    features: [
      {
        title: "Développer le réseau",
        description:
          "Chaque nouvelle Yéchiva Ben Hazmanim qui ouvre renforce cette dynamique de Torah.",
      },
      {
        title: "Accueillir chaque Bahour",
        description:
          "Chaque nouveau participant donne davantage de force à cette mission collective.",
      },
      {
        title: "Travailler avec les Kehilot",
        description:
          "Chaque partenariat avec une Kehila permet d'étendre encore cette mission.",
      },
      {
        title: "Créer un Makom Torah",
        description:
          "Notre ambition est claire : que chaque Bahour francophone puisse trouver, partout où il se trouve, un véritable Makom Torah pendant Ben Hazmanim.",
      },
    ],
    audience: [
      "Bahourim francophones étudiant en Yechiva",
      "Jeunes souhaitant garder un cadre de Torah pendant les vacances",
      "Étudiants recherchant une expérience enrichissante avec d'autres jeunes",
    ],
    values: [
      { title: "Torah", description: "Maintenir un lien fort avec l'étude." },
      { title: "Fraternité", description: "Créer des liens entre jeunes francophones." },
      { title: "Motivation", description: "Donner une dynamique positive pour continuer à avancer." },
      { title: "Accompagnement", description: "Permettre à chacun de trouver sa place." },
    ],
    gallery: [
      "Études",
      "Sederim",
      "Moments de partage",
      "Activités",
      "Participants",
      "Communautés partenaires",
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
      title: "Créer des moments qui marquent les parcours",
      paragraphs: [
        "L'année d'un jeune étudiant en Israël est rythmee par l'étude et la vie en Yechiva.",
        "Les Shabbatot Bnei Yeshivot offrent un moment différent pour sortir du cadre quotidien et construire une vraie communauté.",
      ],
      bullets: [
        "Rencontrer d'autres jeunes francophones",
        "Renforcer son lien avec la Torah",
        "Partager des moments de qualité",
        "Créer une véritable communauté",
      ],
    },
    featureTitle: "Un Chabbat autour de la Torah et de la fraternité",
    featureDescription:
      "Chaque Chabbat rassemble cours, repas, rencontres et moments de partage dans un esprit chaleureux.",
    features: [
      {
        title: "Temps de Torah",
        description: "Cours, divrei Torah, études et rencontres avec des Rabbanim.",
      },
      {
        title: "Rencontres",
        description: "Moments de discussion et création de liens entre jeunes.",
      },
      {
        title: "Repas de Chabbat",
        description: "Des repas organisés dans une ambiance conviviale.",
      },
      {
        title: "Ambiance communautaire",
        description: "Un esprit de fraternité ù chacun trouve sa place.",
      },
    ],
    audience: [
      "Bahourim francophones",
      "Étudiants en Israël",
      "Jeunes souhaitant partager un moment de Torah et de communauté",
      "Familles et participants souhaitant rejoindre une dynamique francophone",
    ],
    gallery: [
      "Repas de Chabbat",
      "Études",
      "Interventions",
      "Participants",
      "Moments de convivialite",
    ],
    testimonials: ["Jeunes", "Familles", "Rabbanim"],
  },
  "talmoudo-beyado": {
    heroText:
      "Un programme pour donner aux Bahourim les outils de progresser dans leur étude avec régularité, objectifs et encouragement.",
    primaryCta: "Je rejoins Talmoudo Beyado",
    intro: {
      eyebrow: "Notre vision",
      title: "Transformer l'étude en un objectif concret",
      paragraphs: [
        "Beaucoup de Bahourim etudient avec sérieux, mais il est parfois difficile de garder un rythme régulier, de fixer des objectifs et de mesurer ses progrès.",
      ],
      bullets: [
        "Fixer des objectifs d'étude",
        "Approfondir ses connaissances",
        "Réviser régulièrement",
        "Évaluer sa progression",
        "Être encouragé dans son parcours",
      ],
    },
    featureTitle: "Comment fonctionne le programme ?",
    featureDescription:
      "Un parcours base sur l'étude, la revision, les mivhanim et un suivi motivant.",
    features: [
      {
        title: "Étude quotidienne",
        description:
          "Les participants poursuivent leur étude en Yechiva avec un objectif personnel de progression.",
      },
      {
        title: "Revisions regulieres",
        description:
          "Un travail de revision consolide les connaissances acquises.",
      },
      {
        title: "Mivhanim mensuels",
        description:
          "Des examens reguliers permettent d'évaluer la maîtrise du sujet étudié.",
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
        value: "Communiquees environ une semaine à l'avance",
      },
    ],
    audience: [
      "Bahourim de Yechiva Guedola en Israël",
      "Jeunes francophones étudiant dans une Yechiva en Israël",
    ],
    values: [
      { title: "Étudier", description: "Donner une nouvelle dimension au limoud." },
      { title: "Réviser", description: "Consolider ce qui a été appris." },
      { title: "Réussir", description: "Avancer avec des objectifs mesurables." },
      { title: "Continuer", description: "Garder une dynamique de progression." },
    ],
    gallery: [
      "Mivhanim",
      "Participants",
      "Remises de bourses",
      "Rencontres",
      "Rabbanim présents",
    ],
    testimonials: [
      "Bahourim participants",
      "Rabbanim",
      "Responsables de Yechivot",
    ],
    formFields: [
      "Nom",
      "Prénom",
      "Age",
      "Yechiva",
      "Téléphone",
      "Email",
      "Massekhet étudiée actuellement",
    ],
  },
  "bayit-neeman": {
    heroText:
      "Un accompagnement sérieux et professionnel pour aider les jeunes à construire un foyer base sur les valeurs de la Torah.",
    primaryCta: "Parler avec un conseiller",
    secondaryHref: "https://binianadeiad.com",
    secondaryCta: "Créer mon profil Chidoukh",
    intro: {
      eyebrow: "Binian Adei Ad",
      title: "Accompagner les jeunes dans la construction de leur futur foyer",
      paragraphs: [
        "Construire un foyer base sur les valeurs de la Torah est une étape essentielle dans la vie d'un jeune.",
        "Notre accompagnement repose sur deux axes complémentaires : favoriser des rencontres adaptées grâce au réseau de Chidoukhim et accompagner les jeunes avant, pendant et après cette étape importante.",
      ],
    },
    featureTitle: "Chidoukhim et accompagnement au mariage",
    featureDescription:
      "Une démarche construite avec discrétion, écoute, Rabbanim et personnes compétentes.",
    features: [
      {
        title: "Plateforme dédiée",
        description:
          "Chaque participant peut créer un profil complet pour presenter son parcours, ses valeurs et son projet de vie.",
      },
      {
        title: "Réseau de Shadkhanim",
        description:
          "Des personnes de confiance et des professionnels etudient les profils et proposent des rencontres adaptées.",
      },
      {
        title: "Avant le mariage",
        description:
          "Soirées de preparation, conferences, conseils pratiques et interventions de Rabbanim.",
      },
      {
        title: "Après le mariage",
        description:
          "Cours d'Adraha, conseils de Hashkafa, Halakhot essentielles et accompagnement des premieres étapes.",
      },
    ],
    audience: [
      "Jeunes en recherche de Chidoukh",
      "Jeunes fiances souhaitant être accompagnes",
      "Jeunes couples au début de leur construction",
    ],
    values: [
      { title: "Écoute", description: "Comprendre chaque parcours avec attention." },
      { title: "Discrétion", description: "Respecter la sensibilite de chaque démarche." },
      { title: "Confiance", description: "Travailler avec des personnes fiables." },
      { title: "Torah", description: "Construire un foyer avec des repères solides." },
    ],
  },
  chidoukhim: {
    heroText:
      "Un accompagnement base sur l'écoute, la discrétion et la confiance pour aider les jeunes à avancer dans leur recherche.",
    primaryCta: "Créer mon profil Chidoukh",
    secondaryHref: "https://binianadeiad.com",
    secondaryCta: "Accéder a Binian Adei Ad",
    intro: {
      eyebrow: "Chidoukhim",
      title: "Des rencontres serieuses et adaptées",
      paragraphs: [
        "La recherche du bon conjoint est une étape importante qui nécessite écoute, réflexion et accompagnement.",
        "Bnei Yeshivot développe ce service en collaboration avec des personnes de confiance et des professionnels du domaine.",
      ],
      bullets: [
        "Création d'un profil personnel",
        "Étude des parcours et valeurs recherchees",
        "Propositions adaptées",
        "Accompagnement des démarches",
      ],
    },
    featureTitle: "Un travail en réseau",
    featureDescription:
      "L'accompagnement se construit avec des Shadkhanim, Yechivot, seminaires, communautés et responsables éducatifs.",
    features: [
      {
        title: "Profil complet",
        description:
          "Informations personnelles, parcours, études, projet de vie et attentes concernant le futur conjoint.",
      },
      {
        title: "Shadkhanim de qualité",
        description:
          "Des personnes de confiance qui partagent une même vision et une même exigence.",
      },
      {
        title: "Collaboration",
        description:
          "Des liens avec les etablissements et communautés pour mieux comprendre les parcours.",
      },
    ],
    values: [
      { title: "Sérieux", description: "Une démarche reflechie et encadree." },
      { title: "Discrétion", description: "Une attention particuliere à la confidentialité." },
      { title: "Confiance", description: "Des propositions adaptées et responsables." },
    ],
  },
  avrekhim: {
    heroText:
      "Des cadres de Torah et une dynamique communautaire pour accompagner les Avrekhim francophones installes en Israël.",
    primaryCta: "Decouvrir le Programme Avrekhim",
    intro: {
      eyebrow: "Programme Avrekhim",
      title: "Accompagner les Avrekhim dans leur étude et leur vie quotidienne",
      paragraphs: [
        "Bnei Yeshivot développe des cadres de Torah et une dynamique communautaire pour permettre aux Avrekhim de continuer leur étude dans un environnement sérieux, chaleureux et adapté.",
      ],
    },
    featureTitle: "Les cadres du programme",
    featureDescription:
      "Deux kollelim et une communauté d'Avrekhim francophones autour de l'étude, du partage et de la solidarité.",
    features: [
      {
        title: "Kollel Erev Zikhron Eliyahou",
        description:
          "Un cadre d'étude régulier a Jérusalem qui rassemble actuellement 12 Avrekhim.",
      },
      {
        title: "Kollel Chichi Ohel Yaacov",
        description:
          "Un rendez-vous hebdomadaire autour de la Torah qui rassemble actuellement 10 Avrekhim.",
      },
      {
        title: "Communauté d'Avrekhim",
        description:
          "Renforcer la solidarité, les rencontres, l'entraide et la vie communautaire.",
      },
      {
        title: "Lien avec Kesher Nitsri",
        description:
          "Les actions de solidarité sont soutenues par la communauté Kesher Nitsri.",
      },
    ],
    values: [
      { title: "Étude", description: "Renforcer l'étude quotidienne." },
      { title: "Dynamique", description: "Créer un lien durable entre Avrekhim." },
      { title: "Familles", description: "Renforcer les liens entre familles francophones." },
      { title: "Solidarité", description: "Développer une communauté attentive aux besoins." },
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
                  <CardTitle>
                    {slug === "ben-hazmanim"
                      ? "Présence du réseau"
                      : "Ce que cela apporte"}
                  </CardTitle>
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

        {slug === "ben-hazmanim" ? <BenHazmanimFranceMap /> : null}

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
                        utiles a l&apos;équipe.
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
              <h2>Notre équipe peut vous accompagner dans la prochaine étape.</h2>
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
