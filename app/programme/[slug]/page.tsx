import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../components";
import benHazmanimGallery from "@/public/programmes/ben-azmanim/gallery.json";
import { getProgram, programmes } from "../programmes";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isMivhanRegistrationOpen } from "@/lib/talmoudo-beyado";
import { TalmoudoProgramSignupCta } from "@/components/talmoudo-program-signup-cta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BenHazmanimFranceMap } from "@/components/ben-hazmanim-france-map";
import { fileUrl } from "@/lib/files";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  BedDouble,
  BookOpen,
  Boxes,
  CheckCircle2,
  ClipboardList,
  HandHeart,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  XIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  rabbis?: string[];
  practical?: Array<{
    label: string;
    value: string;
  }>;
  gallery?: string[];
  testimonials?: string[];
  formFields?: string[];
  secondaryHref?: string;
  secondaryCta?: string;
  // Sections sur-mesure (Chabbat Plein).
  pillars?: Array<{ Icon: LucideIcon; title: string; description: string }>;
  community?: { eyebrow: string; title: string; paragraphs: string[] };
  organisation?: {
    title: string;
    description: string;
    items: Array<{ Icon: LucideIcon; label: string }>;
  };
  galleryImages?: string[];
  finalCta?: {
    eyebrow: string;
    title: string;
    text: string;
    primaryCta: string;
    primaryHref: string;
  };
};

const benHazmanimShortUrl =
  "https://www.youtube-nocookie.com/embed/kuM2P0GIs8o?rel=0&modestbranding=1&playsinline=1";
const benHazmanimPhotos = benHazmanimGallery.items
  .map((item) => fileUrl(item.key))
  .filter((src): src is string => Boolean(src));

const programDetails: Record<string, ProgramDetail> = {
  "beth-hamidrach": {
    heroText:
      "Le rendez-vous hebdomadaire de Torah des jeunes francophones en Israël. Chaque jeudi soir à Bayit Vagan, près d’une centaine de Bahourim et d’étudiants se retrouvent autour du Limoud, d’un Vaad, de thèmes pratiques et de moments de partage.",
    primaryCta: "Je m’inscris au Beth Hamidrach",
    intro: {
      eyebrow: "Beth Hamidrach Leil Shishi",
      title: "Bien plus qu’un Beth Hamidrach, construire une communauté de Torah",
      paragraphs: [
        "Étudier la Torah ne se résume pas à assister à un cours. C’est évoluer dans un environnement qui inspire, encourage et permet à chacun de progresser.",
        "Le Beth Hamidrach Leil Shishi a été créé pour offrir aux jeunes francophones en Israël un cadre régulier où ils peuvent approfondir leur Limoud, échanger avec des Rabbanim, découvrir des domaines essentiels de la Halakha et tisser des liens durables avec d’autres Bahourim partageant les mêmes aspirations.",
        "Chaque rencontre est pensée pour renforcer l’attachement à la Torah, transmettre des enseignements de qualité et faire du Beth Hamidrach un véritable point de rassemblement pour la jeunesse francophone.",
      ],
      bullets: [
        "Bayit Vagan - Jérusalem",
        "Près de 100 participants chaque semaine",
        "Rabbanim invités",
        "Un nouveau thème chaque semaine",
      ],
    },
    featureTitle: "Une soirée construite autour de la Torah",
    featureDescription:
      "Chaque jeudi soir s’articule autour de temps forts clairs, dans l’ambiance authentique d’un Beth Hamidrach.",
    features: [
      {
        title: "Seder Limoud",
        description:
          "Une étude approfondie dans une ambiance de Limoud sérieuse et vivante.",
      },
      {
        title: "Vaad",
        description:
          "Des enseignements dispensés par des Rabbanim et intervenants autour de thèmes fondamentaux de la Torah et de la vie juive.",
      },
      {
        title: "Thèmes pratiques",
        description:
          "Chaque semaine, un nouveau sujet est développé afin d’aborder la Halakha de manière concrète.",
      },
      {
        title: "Kumzitz et partage",
        description:
          "La soirée se conclut dans une ambiance chaleureuse autour d’un Kumzitz, d’une collation et d’échanges entre les participants.",
      },
    ],
    audience: [
      "Bahourim des Yéchivot",
      "Étudiants francophones en Israël",
      "Jeunes souhaitant approfondir leur Limoud",
      "Toute personne recherchant un cadre régulier de Torah et de progression",
    ],
    values: [
      {
        title: "Limoud",
        description: "Approfondir l’étude chaque semaine avec un cadre régulier.",
      },
      {
        title: "Communauté",
        description:
          "Créer des liens durables entre jeunes francophones partageant les mêmes aspirations.",
      },
      {
        title: "Rabbanim",
        description: "Recevoir une Torah transmise par des Rabbanim et intervenants de qualité.",
      },
      {
        title: "Halakha pratique",
        description:
          "Relier les enseignements à des sujets concrets de la vie juive.",
      },
    ],
    rabbis: [
      "Rabbanim invités",
      "Intervenants de Torah",
      "Rabbanim de Yéchivot",
      "Responsables communautaires",
      "Maggidei Shiour",
    ],
    practical: [
      { label: "Lieu", value: "Bayit Vagan - Jérusalem" },
      { label: "Rencontres", value: "Rencontres exceptionnelles à Bnei Brak" },
      { label: "Jour", value: "Chaque jeudi soir" },
      { label: "Participants", value: "Près de 100 jeunes chaque semaine" },
    ],
    gallery: [
      "Seder Limoud",
      "Vaad",
      "Thèmes pratiques",
      "Kumzitz",
      "Moments de partage",
    ],
  },
  "ben-hazmanim": {
    heroText:
      "Le plus grand réseau francophone de Yéchivot Ben Hazmanim en France et en Israël.",
    primaryCta: "Voir les prochains programmes",
    intro: {
      eyebrow: "Notre vision",
      title: "Un véritable mouvement de Torah pendant les vacances",
      paragraphs: [
        "Chaque période de Ben Hazmanim représente un défi : comment permettre à des centaines de Bahourim francophones de continuer à vivre un véritable rythme de Torah, même pendant les vacances ?",
        "Pour répondre à ce besoin, Bnei Yeshivot a développé, au fil des années, un réseau structuré de Yéchivot Ben Hazmanim qui rassemble aujourd’hui des centaines de jeunes à travers la France et Israël.",
        "Bien plus qu’un simple programme de vacances, Ben Hazmanim est devenu un véritable mouvement de Torah, porté par des Rabbanim, des responsables de Kehilot et des équipes locales qui partagent une même ambition : permettre à chaque Bahour de continuer à grandir dans la Torah, où qu’il se trouve.",
      ],
      bullets: [
        "Un réseau structuré en France et en Israël",
        "Des centaines de Bahourim francophones",
        "Des Rabbanim et responsables de Kehilot",
        "Un véritable Makom Torah pendant les vacances",
      ],
    },
    featureTitle: "Un réseau de programmes en France et en Israël",
    featureDescription:
      "Bnei Yeshivot développe un réseau de Yéchivot Ben Hazmanim pour permettre à chaque Bahour de trouver un cadre proche, adapté et motivant.",
    features: [
      {
        title: "En France",
        description:
          "Des programmes organisés dans plusieurs villes de Paris et de sa région avec des communautés locales.",
      },
      {
        title: "En Israël",
        description:
          "Des cadres notamment à Jérusalem pour accompagner les jeunes présents en Israël pendant les vacances.",
      },
      {
        title: "Dynamique communautaire",
        description:
          "Une collaboration avec des Kehilot, Yéchivot et acteurs de terrain.",
      },
      {
        title: "Plus de 300 participants par an",
        description:
          "Les dernières éditions ont réuni des Bahourim, Avrekhim et étudiants en France et en Israël.",
      },
    ],
    audience: [
      "Bahourim francophones étudiant en Yéchiva",
      "Jeunes souhaitant garder un cadre de Torah pendant les vacances",
      "Étudiants recherchant une expérience enrichissante avec d’autres jeunes",
    ],
    values: [
      { title: "Torah", description: "Maintenir un lien fort avec l’étude." },
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
  },
  shabbatot: {
    heroText:
      "Le rendez-vous incontournable de la jeunesse francophone. Bien plus qu’un simple programme : un Chabbat d’exception placé sous le signe de la Torah, de la fraternité et de la Sim’ha.",
    primaryCta: "Rejoindre le prochain Chabbat Plein",
    intro: {
      eyebrow: "Notre vision",
      title: "Créer des moments qui construisent une génération",
      paragraphs: [
        "Chez Bnei Yeshivot, nous sommes convaincus que certains moments ont la capacité de marquer profondément un parcours.",
        "Un échange avec un Rav, un divrei Torah inspirant, un repas de Chabbat partagé, un chant ou une rencontre peuvent devenir des souvenirs qui accompagnent une personne pendant des années.",
        "C’est cette vision qui anime les Chabbat Plein : un cadre chaleureux et inspirant où chaque participant se renforce dans la Torah, rencontre d’autres jeunes partageant les mêmes valeurs et ressent pleinement l’appartenance à une communauté francophone unie.",
      ],
      bullets: [
        "Se renforcer dans la Torah",
        "Rencontrer d’autres jeunes francophones",
        "Ressentir l’appartenance à une communauté",
        "Repartir avec une nouvelle énergie",
      ],
    },
    featureTitle: "Une expérience pensée dans les moindres détails",
    featureDescription:
      "Chaque Chabbat Plein allie qualité, spiritualité et convivialité autour de quatre temps forts.",
    features: [],
    pillars: [
      {
        Icon: BookOpen,
        title: "Des moments de Torah",
        description:
          "Cours, divrei Torah, échanges et interventions de Rabbanim pour puiser de nouvelles forces et renforcer son attachement à la Torah.",
      },
      {
        Icon: HeartHandshake,
        title: "Des rencontres qui créent des liens",
        description:
          "Des jeunes venus de différentes Yéchivot se retrouvent pour partager leur parcours, échanger et construire des amitiés solides.",
      },
      {
        Icon: UtensilsCrossed,
        title: "Des repas de Chabbat d’exception",
        description:
          "Des repas préparés avec soin, accompagnés de Zemirot, de chants et d’une ambiance chaleureuse où chacun trouve sa place.",
      },
      {
        Icon: Sparkles,
        title: "Une atmosphère unique",
        description:
          "Un cadre basé sur la fraternité, la Sim’ha et le respect, pour vivre pleinement la richesse du Chabbat.",
      },
    ],
    community: {
      eyebrow: "Une communauté",
      title: "Bien plus qu’un Chabbat",
      paragraphs: [
        "Les Chabbat Plein Bnei Yeshivot sont devenus au fil du temps un véritable point de rencontre pour la communauté francophone.",
        "Ils permettent de créer des liens entre jeunes issus de différentes Yéchivot, de renforcer le sentiment d’appartenance et de construire une véritable communauté autour de la Torah. Chaque édition est une occasion de se retrouver, de se renforcer et de vivre ensemble des moments qui restent gravés.",
      ],
    },
    audience: [
      "Bahourim francophones étudiant en Israël",
      "Étudiants souhaitant vivre un Chabbat de Torah dans une ambiance chaleureuse",
      "Jeunes souhaitant rencontrer d’autres francophones partageant les mêmes aspirations",
      "Familles et participants désirant rejoindre une dynamique communautaire forte",
    ],
    organisation: {
      title: "Une organisation au service des participants",
      description:
        "Pour offrir une expérience de grande qualité, l’équipe de Bnei Yeshivot veille à chaque détail afin que chacun se concentre sur l’essentiel : la Torah, les rencontres et la fraternité.",
      items: [
        { Icon: ClipboardList, label: "Organisation générale" },
        { Icon: HandHeart, label: "Accueil des participants" },
        { Icon: BedDouble, label: "Hébergement" },
        { Icon: UtensilsCrossed, label: "Repas" },
        { Icon: ShieldCheck, label: "Encadrement" },
        { Icon: Boxes, label: "Logistique" },
      ],
    },
    galleryImages: [
      "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=900&q=80",
    ],
    finalCta: {
      eyebrow: "Rejoignez le prochain Chabbat Plein",
      title: "Vous souhaitez vivre un Chabbat différent ?",
      text: "Un Chabbat où la Torah, la fraternité et la communauté se rencontrent. Découvrez les prochains Chabbat Plein Bnei Yeshivot et rejoignez une dynamique qui rassemble chaque année de nombreux jeunes francophones.",
      primaryCta: "Découvrir les prochains Chabbat Plein",
      primaryHref: "/evenements",
    },
  },
  "talmoudo-beyado": {
    heroText:
      "Un programme pour donner aux Bahourim les outils de progresser dans leur étude avec régularité, objectifs et encouragement.",
    primaryCta: "Je rejoins Talmoudo Beyado",
    intro: {
      eyebrow: "Notre vision",
      title: "Transformer l’étude en un objectif concret",
      paragraphs: [
        "Beaucoup de Bahourim étudient avec sérieux, mais il est parfois difficile de garder un rythme régulier, de fixer des objectifs et de mesurer ses progrès.",
        "Talmoudo Beyado donne un cadre clair : chaque Bahour choisit huit dapim dans la massehet qu’il étudie à la yeshiva, les révise, passe un mivhan mensuel, puis retrouve son suivi personnel dans son espace.",
      ],
      bullets: [
        "Fixer des objectifs d’étude",
        "Approfondir ses connaissances",
        "Réviser régulièrement",
        "Évaluer sa progression",
        "Être encouragé dans son parcours",
      ],
    },
    featureTitle: "Comment fonctionne le programme ?",
    featureDescription:
      "Un parcours basé sur l’étude, la révision, les mivhanim et un suivi motivant.",
    flow: [
      "L’administration fixe la date du prochain mivhan mensuel",
      "Le Bahour s’inscrit avec sa massehet et huit dapim",
      "Les inscriptions ferment automatiquement avant le mivhan",
      "Le Bahour passe le mivhan sur les dapim choisis",
      "L’équipe renseigne la note et la récompense",
      "Le résultat arrive par email et dans l’espace Bahour",
    ],
    features: [
      {
        title: "Étude quotidienne",
        description:
          "Les participants poursuivent leur étude en Yéchiva avec un objectif personnel de progression.",
      },
      {
        title: "Révisions régulières",
        description:
          "Un travail de révision consolide les connaissances acquises.",
      },
      {
        title: "Mivhanim mensuels",
        description:
          "Des examens réguliers permettent d’évaluer la maîtrise du sujet étudié.",
      },
      {
        title: "Bourse d’encouragement",
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
        value: "Communiquées environ une semaine à l’avance",
      },
    ],
    audience: [
      "Bahourim de Yéchiva Guedola en Israël",
      "Jeunes francophones étudiant dans une Yéchiva en Israël",
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
      "Responsables de Yéchivot",
    ],
    formFields: [
      "Nom",
      "Prénom",
      "Âge",
      "Yéchiva",
      "Téléphone",
      "Email",
      "Massekhet étudiée actuellement",
    ],
  },
  "bayit-neeman": {
    heroText:
      "Un accompagnement sérieux et professionnel pour aider les jeunes à construire un foyer basé sur les valeurs de la Torah.",
    primaryCta: "Parler avec un conseiller",
    secondaryHref: "https://binianadeiad.com",
    secondaryCta: "Créer mon profil Chidoukh",
    intro: {
      eyebrow: "Binian Adei Ad",
      title: "Accompagner les jeunes dans la construction de leur futur foyer",
      paragraphs: [
        "Construire un foyer basé sur les valeurs de la Torah est une étape essentielle dans la vie d’un jeune.",
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
          "Chaque participant peut créer un profil complet pour présenter son parcours, ses valeurs et son projet de vie.",
      },
      {
        title: "Réseau de Shadkhanim",
        description:
          "Des personnes de confiance et des professionnels étudient les profils et proposent des rencontres adaptées.",
      },
      {
        title: "Avant le mariage",
        description:
          "Soirées de préparation, conférences, conseils pratiques et interventions de Rabbanim.",
      },
      {
        title: "Après le mariage",
        description:
          "Cours d’Adraha, conseils de Hashkafa, Halakhot essentielles et accompagnement des premières étapes.",
      },
    ],
    audience: [
      "Jeunes en recherche de Chidoukh",
      "Jeunes fiancés souhaitant être accompagnés",
      "Jeunes couples au début de leur construction",
    ],
    values: [
      { title: "Écoute", description: "Comprendre chaque parcours avec attention." },
      { title: "Discrétion", description: "Respecter la sensibilité de chaque démarche." },
      { title: "Confiance", description: "Travailler avec des personnes fiables." },
      { title: "Torah", description: "Construire un foyer avec des repères solides." },
    ],
  },
  chidoukhim: {
    heroText:
      "Un accompagnement basé sur l’écoute, la discrétion et la confiance pour aider les jeunes à avancer dans leur recherche.",
    primaryCta: "Créer mon profil Chidoukh",
    secondaryHref: "https://binianadeiad.com",
    secondaryCta: "Accéder à Binian Adei Ad",
    intro: {
      eyebrow: "Chidoukhim",
      title: "Des rencontres sérieuses et adaptées",
      paragraphs: [
        "La recherche du bon conjoint est une étape importante qui nécessite écoute, réflexion et accompagnement.",
        "Bnei Yeshivot développe ce service en collaboration avec des personnes de confiance et des professionnels du domaine.",
      ],
      bullets: [
        "Création d’un profil personnel",
        "Étude des parcours et valeurs recherchées",
        "Propositions adaptées",
        "Accompagnement des démarches",
      ],
    },
    featureTitle: "Un travail en réseau",
    featureDescription:
      "L’accompagnement se construit avec des Shadkhanim, Yéchivot, séminaires, communautés et responsables éducatifs.",
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
          "Des liens avec les établissements et communautés pour mieux comprendre les parcours.",
      },
    ],
    values: [
      { title: "Sérieux", description: "Une démarche réfléchie et encadrée." },
      { title: "Discrétion", description: "Une attention particulière à la confidentialité." },
      { title: "Confiance", description: "Des propositions adaptées et responsables." },
    ],
  },
  avrekhim: {
    heroText:
      "Des cadres de Torah et une dynamique communautaire pour accompagner les Avrekhim francophones installés en Israël.",
    primaryCta: "Découvrir le Programme Avrekhim",
    intro: {
      eyebrow: "Programme Avrekhim",
      title: "Accompagner les Avrekhim dans leur étude et leur vie quotidienne",
      paragraphs: [
        "Bnei Yeshivot développe des cadres de Torah et une dynamique communautaire pour permettre aux Avrekhim de continuer leur étude dans un environnement sérieux, chaleureux et adapté.",
      ],
    },
    featureTitle: "Les cadres du programme",
    featureDescription:
      "Deux kollelim et une communauté d’Avrekhim francophones autour de l’étude, du partage et de la solidarité.",
    features: [
      {
        title: "Kollel Erev Zikhron Eliyahou",
        description:
          "Un cadre d’étude régulier à Jérusalem qui rassemble actuellement 12 Avrekhim.",
      },
      {
        title: "Kollel Chichi Ohel Yaacov",
        description:
          "Un rendez-vous hebdomadaire autour de la Torah qui rassemble actuellement 10 Avrekhim.",
      },
      {
        title: "Communauté d’Avrekhim",
        description:
          "Renforcer la solidarité, les rencontres, l’entraide et la vie communautaire.",
      },
      {
        title: "Lien avec Kesher Nitsri",
        description:
          "Les actions de solidarité sont soutenues par la communauté Kesher Nitsri.",
      },
    ],
    values: [
      { title: "Étude", description: "Renforcer l’étude quotidienne." },
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

export const dynamic = "force-dynamic";

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

function ProgramVisualGallery() {
  return (
    <section className="section band">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Galerie</span>
            <h2>Photos et Short Ben Hazmanim</h2>
          </div>
          <p>
            Des images et un format court pour retrouver l’ambiance du
            programme Ben Hazmanim.
          </p>
        </div>

        <div className="ben-gallery-pair">
          <Dialog>
            <DialogTrigger
              render={<button className="gallery-card-trigger" type="button" />}
            >
              <Card className="gallery-card">
                <div className="gallery-card-mosaic">
                  {benHazmanimPhotos.slice(0, 5).map((photo, photoIndex) => (
                    <div
                      className={
                        photoIndex === 0
                          ? "gallery-mosaic-cell gallery-mosaic-main"
                          : "gallery-mosaic-cell"
                      }
                      key={photo}
                    >
                      <Image
                        alt=""
                        fill
                        sizes="(max-width: 980px) 50vw, 20vw"
                        src={photo}
                      />
                    </div>
                  ))}
                </div>
                <CardHeader>
                  <Badge variant="info">{benHazmanimPhotos.length} photos</Badge>
                  <CardTitle>Galerie photos</CardTitle>
                  <CardDescription>
                    Moments d’étude, rencontres et ambiance du programme.
                  </CardDescription>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="gallery-dialog-content max-h-[92vh] overflow-hidden p-0 sm:max-w-5xl"
            >
              <DialogHeader className="gallery-dialog-header">
                <div className="grid gap-2">
                  <DialogTitle>Galerie photos</DialogTitle>
                  <DialogDescription>
                    Moments d’étude, rencontres et ambiance du programme.
                  </DialogDescription>
                </div>
                <DialogClose
                  render={
                    <Button aria-label="Fermer" variant="ghost" size="icon-sm" />
                  }
                >
                  <XIcon className="size-4" />
                </DialogClose>
              </DialogHeader>
              <div className="gallery-dialog-scroll">
                <div className="gallery-dialog-grid">
                  {benHazmanimPhotos.map((photo, photoIndex) => (
                    <div
                      className={
                        photoIndex === 0
                          ? "gallery-dialog-photo gallery-dialog-photo-featured"
                          : "gallery-dialog-photo"
                      }
                      key={photo}
                    >
                      <Image
                        alt=""
                        fill
                        sizes="(max-width: 980px) 100vw, 33vw"
                        src={photo}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Card className="ben-short-card">
            <div className="gallery-dialog-video ben-short-video">
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                src={benHazmanimShortUrl}
                title="Short Ben Hazmanim"
              />
            </div>
            <CardHeader>
              <Badge variant="warning">Short</Badge>
              <CardTitle>Le Short Ben Hazmanim</CardTitle>
              <CardDescription>
                Le format vidéo court du programme.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
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
  } = program;
  const detail = programDetails[slug];

  if (!detail) {
    notFound();
  }

  const primaryCta = detail.primaryCta || ctaLabel;
  const [currentUser, upcomingMivhanSessions] =
    slug === "talmoudo-beyado"
      ? await Promise.all([
          getCurrentUser(),
          prisma.mivhanSession.findMany({
            where: { date: { gte: new Date() } },
            orderBy: { date: "asc" },
          }),
        ])
      : [null, []];
  const nextMivhanSession = upcomingMivhanSessions[0] ?? null;
  const nextMivhanRegistration =
    currentUser && nextMivhanSession
      ? await prisma.mivhanRegistration.findUnique({
          where: {
            sessionId_userId: {
              sessionId: nextMivhanSession.id,
              userId: currentUser.id,
            },
          },
          select: { id: true },
        })
      : null;
  const talmoudoSessionOptions = upcomingMivhanSessions
    .map((session) => ({
      disabled: !isMivhanRegistrationOpen(session),
      id: session.id,
      location: session.location,
      title: session.title,
      dateLabel: new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(session.date),
    }));
  const nextMivhanOption =
    nextMivhanSession && talmoudoSessionOptions.length > 0
      ? talmoudoSessionOptions[0]
      : null;

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
              <h1>{slug === "ben-hazmanim" ? "Yeshivot Ben Azmanim" : title}</h1>
              <p>{detail.heroText || description}</p>
              <div className="hero-actions">
                <Button asChild variant="accent" size="lg">
                  <Link
                    href={
                      slug === "talmoudo-beyado"
                        ? "#inscription-talmoudo"
                        : "/contact"
                    }
                  >
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
            {detail.pillars?.length ? (
              <div className="shabbat-pillar-grid">
                {detail.pillars.map(({ Icon, title, description }) => (
                  <Card className="shabbat-pillar-card" key={title}>
                    <CardHeader>
                      <span className="shabbat-pillar-icon">
                        <Icon className="size-6" />
                      </span>
                      <CardTitle>{title}</CardTitle>
                      <CardDescription>{description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="program-detail-feature-grid">
                {detail.features.map((feature, index) => (
                  <Card
                    className="program-detail-feature-card"
                    key={feature.title}
                  >
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
            )}
          </div>
        </section>

        {detail.community ? (
          <section className="section shabbat-community">
            <div className="container shabbat-community-inner">
              <span className="eyebrow">{detail.community.eyebrow}</span>
              <h2>{detail.community.title}</h2>
              {detail.community.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ) : null}

        {detail.rabbis?.length ? (
          <section className="section">
            <div className="container">
              <div className="section-header">
                <div>
                  <span className="eyebrow">Rabbanim</span>
                  <h2>Des Rabbanim de renom</h2>
                </div>
                <p>
                  Le Beth Hamidrach Bnei Yeshivot accueille tout au long de
                  l’année des Rabbanim et intervenants reconnus qui viennent
                  transmettre leur Torah et partager leur expérience.
                </p>
              </div>
              <div className="program-rabbi-rail" aria-label="Rabbanim invites">
                <div className="program-rabbi-track">
                  {[...detail.rabbis, ...detail.rabbis].map((rabbi, index) => (
                    <div className="program-rabbi-card" key={`${rabbi}-${index}`}>
                      <span>{rabbi.slice(0, 1)}</span>
                      <strong>{rabbi}</strong>
                      <small>Beth Hamidrach Leil Shishi</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {slug === "ben-hazmanim" ? <BenHazmanimFranceMap /> : null}

        {slug === "ben-hazmanim" ? (
          <ProgramVisualGallery />
        ) : null}

        {detail.flow?.length ? (
          <section className="section">
            <div className="container">
              <div className="section-header">
                <h2>Le déroulement</h2>
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

        {slug === "talmoudo-beyado" ? (
          <section className="section band" id="inscription-talmoudo">
            <div className="container">
              <div className="section-header">
                <div>
                  <span className="eyebrow">Inscription</span>
                  <h2>Choisir sa massehet et ses huit dapim</h2>
                </div>
                <p>
                  L’inscription se rattache au mivhan ouvert par
                  l’administration. Un Bahour connecté n’a plus qu’à
                  renseigner son limoud, sauf informations de profil manquantes.
                </p>
              </div>
              <TalmoudoProgramSignupCta
                alreadyRegistered={Boolean(nextMivhanRegistration)}
                initialUser={currentUser}
                session={nextMivhanOption}
              />
            </div>
          </section>
        ) : null}

        <section className={detail.flow?.length ? "section band" : "section"}>
          <div className="container program-detail-two-column">
            {detail.audience?.length ? (
              <Card className="program-detail-panel">
                <CardHeader>
                  <CardTitle>Pour qui ?</CardTitle>
                  <CardDescription>
                    Le programme s’adresse aux jeunes qui souhaitent avancer
                    dans un cadre sérieux, humain et adapté.
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

        {detail.organisation ? (
          <section className="section band">
            <div className="container">
              <div className="section-header">
                <div>
                  <span className="eyebrow">Coulisses</span>
                  <h2>{detail.organisation.title}</h2>
                </div>
                <p>{detail.organisation.description}</p>
              </div>
              <div className="shabbat-orga-grid">
                {detail.organisation.items.map(({ Icon, label }) => (
                  <div className="shabbat-orga-item" key={label}>
                    <span className="shabbat-orga-icon">
                      <Icon className="size-5" />
                    </span>
                    <strong>{label}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {detail.galleryImages?.length ? (
          <section className="section">
            <div className="container">
              <div className="section-header">
                <div>
                  <span className="eyebrow">Galerie</span>
                  <h2>Les plus beaux moments</h2>
                </div>
                <p>
                  Repas de Chabbat, cours de Torah, interventions de Rabbanim et
                  ambiance communautaire.
                </p>
              </div>
              <div className="shabbat-gallery">
                {detail.galleryImages.map((src, index) => (
                  <div
                    className={
                      index === 0
                        ? "shabbat-gallery-cell shabbat-gallery-cell-feature"
                        : "shabbat-gallery-cell"
                    }
                    key={src}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(max-width: 980px) 50vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {(detail.gallery?.length || detail.testimonials?.length || detail.formFields?.length) ? (
          <section className="section">
            <div className="container">
              <div className="program-detail-resource-grid">
                {detail.gallery?.length && slug !== "ben-hazmanim" ? (
                  <Card className="program-detail-resource-card">
                    <CardHeader>
                      <CardTitle>Galerie</CardTitle>
                      <CardDescription>
                        Photos et vidéos pour montrer l’ambiance du programme.
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
                      <CardTitle>Témoignages</CardTitle>
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
                      <CardTitle>Inscription</CardTitle>
                      <CardDescription>
                        Le formulaire permettra de transmettre les informations
                        utiles à l’équipe.
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

        {detail.finalCta ? (
          <section className="section">
            <div className="container">
              <div className="shabbat-final-cta">
                <span className="eyebrow">{detail.finalCta.eyebrow}</span>
                <h2>{detail.finalCta.title}</h2>
                <p>{detail.finalCta.text}</p>
                <div className="shabbat-final-actions">
                  <Button asChild variant="accent" size="lg">
                    <Link href={detail.finalCta.primaryHref}>
                      <MessageCircle className="size-5" />
                      {detail.finalCta.primaryCta}
                    </Link>
                  </Button>
                  <Button asChild size="lg" className="shabbat-final-secondary">
                    <Link href="/contact">Nous contacter</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="section about-final-cta">
            <div className="container about-final-cta-inner">
              <div>
                <span className="eyebrow">Rejoindre le programme</span>
                <h2>
                  Notre équipe peut vous accompagner dans la prochaine étape.
                </h2>
              </div>
              <div className="hero-actions">
                <Button asChild variant="accent" size="lg">
                  <Link
                    href={
                      slug === "talmoudo-beyado"
                        ? "#inscription-talmoudo"
                        : "/contact"
                    }
                  >
                    {primaryCta}
                  </Link>
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
        )}
      </main>
    </PageShell>
  );
}
