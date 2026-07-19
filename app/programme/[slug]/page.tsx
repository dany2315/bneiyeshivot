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
      "Le rendez-vous hebdomadaire de Torah des jeunes francophones en Israel. Chaque jeudi soir a Bayit Vagan, pres d'une centaine de Bahourim et d'etudiants se retrouvent autour du Limoud, d'un Vaad, de themes pratiques et de moments de partage.",
    primaryCta: "Je m'inscris au Beth Hamidrach",
    intro: {
      eyebrow: "Beth Hamidrach Leil Shishi",
      title: "Bien plus qu'un Beth Hamidrach, construire une communaute de Torah",
      paragraphs: [
        "Etudier la Torah ne se resume pas a assister a un cours. C'est evoluer dans un environnement qui inspire, encourage et permet a chacun de progresser.",
        "Le Beth Hamidrach Leil Shishi a ete cree pour offrir aux jeunes francophones en Israel un cadre regulier ou ils peuvent approfondir leur Limoud, echanger avec des Rabbanim, decouvrir des domaines essentiels de la Halakha et tisser des liens durables avec d'autres Bahourim partageant les memes aspirations.",
        "Chaque rencontre est pensee pour renforcer l'attachement a la Torah, transmettre des enseignements de qualite et faire du Beth Hamidrach un veritable point de rassemblement pour la jeunesse francophone.",
      ],
      bullets: [
        "Bayit Vagan - Jerusalem",
        "Pres de 100 participants chaque semaine",
        "Rabbanim invites",
        "Un nouveau theme chaque semaine",
      ],
    },
    featureTitle: "Une soiree construite autour de la Torah",
    featureDescription:
      "Chaque jeudi soir s'articule autour de temps forts clairs, dans l'ambiance authentique d'un Beth Hamidrach.",
    features: [
      {
        title: "Seder Limoud",
        description:
          "Une etude approfondie dans une ambiance de Limoud serieuse et vivante.",
      },
      {
        title: "Vaad",
        description:
          "Des enseignements dispenses par des Rabbanim et intervenants autour de themes fondamentaux de la Torah et de la vie juive.",
      },
      {
        title: "Themes pratiques",
        description:
          "Chaque semaine, un nouveau sujet est developpe afin d'aborder la Halakha de maniere concrete.",
      },
      {
        title: "Kumzitz et partage",
        description:
          "La soiree se conclut dans une ambiance chaleureuse autour d'un Kumzitz, d'une collation et d'echanges entre les participants.",
      },
    ],
    audience: [
      "Bahourim des Yechivot",
      "Etudiants francophones en Israel",
      "Jeunes souhaitant approfondir leur Limoud",
      "Toute personne recherchant un cadre regulier de Torah et de progression",
    ],
    values: [
      {
        title: "Limoud",
        description: "Approfondir l'etude chaque semaine avec un cadre regulier.",
      },
      {
        title: "Communaute",
        description:
          "Creer des liens durables entre jeunes francophones partageant les memes aspirations.",
      },
      {
        title: "Rabbanim",
        description: "Recevoir une Torah transmise par des Rabbanim et intervenants de qualite.",
      },
      {
        title: "Halakha pratique",
        description:
          "Relier les enseignements a des sujets concrets de la vie juive.",
      },
    ],
    rabbis: [
      "Rabbanim invites",
      "Intervenants de Torah",
      "Rabbanim de Yechivot",
      "Responsables communautaires",
      "Maggidei Shiour",
    ],
    practical: [
      { label: "Lieu", value: "Bayit Vagan - Jerusalem" },
      { label: "Rencontres", value: "Rencontres exceptionnelles a Bnei Brak" },
      { label: "Jour", value: "Chaque jeudi soir" },
      { label: "Participants", value: "Pres de 100 jeunes chaque semaine" },
    ],
    gallery: [
      "Seder Limoud",
      "Vaad",
      "Themes pratiques",
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
        "Un reseau structure en France et en Israel",
        "Des centaines de Bahourim francophones",
        "Des Rabbanim et responsables de Kehilot",
        "Un veritable Makom Torah pendant les vacances",
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
        title: "Plus de 300 participants par an",
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
  },
  shabbatot: {
    heroText:
      "Le rendez-vous incontournable de la jeunesse francophone. Bien plus qu'un simple programme : un Chabbat d'exception place sous le signe de la Torah, de la fraternite et de la Sim'ha.",
    primaryCta: "Rejoindre le prochain Chabbat Plein",
    intro: {
      eyebrow: "Notre vision",
      title: "Creer des moments qui construisent une generation",
      paragraphs: [
        "Chez Bnei Yeshivot, nous sommes convaincus que certains moments ont la capacite de marquer profondement un parcours.",
        "Un echange avec un Rav, un divrei Torah inspirant, un repas de Chabbat partage, un chant ou une rencontre peuvent devenir des souvenirs qui accompagnent une personne pendant des annees.",
        "C'est cette vision qui anime les Chabbat Plein : un cadre chaleureux et inspirant ou chaque participant se renforce dans la Torah, rencontre d'autres jeunes partageant les memes valeurs et ressent pleinement l'appartenance a une communaute francophone unie.",
      ],
      bullets: [
        "Se renforcer dans la Torah",
        "Rencontrer d'autres jeunes francophones",
        "Ressentir l'appartenance a une communaute",
        "Repartir avec une nouvelle energie",
      ],
    },
    featureTitle: "Une experience pensee dans les moindres details",
    featureDescription:
      "Chaque Chabbat Plein allie qualite, spiritualite et convivialite autour de quatre temps forts.",
    features: [],
    pillars: [
      {
        Icon: BookOpen,
        title: "Des moments de Torah",
        description:
          "Cours, divrei Torah, echanges et interventions de Rabbanim pour puiser de nouvelles forces et renforcer son attachement a la Torah.",
      },
      {
        Icon: HeartHandshake,
        title: "Des rencontres qui creent des liens",
        description:
          "Des jeunes venus de differentes Yechivot se retrouvent pour partager leur parcours, echanger et construire des amities solides.",
      },
      {
        Icon: UtensilsCrossed,
        title: "Des repas de Chabbat d'exception",
        description:
          "Des repas prepares avec soin, accompagnes de Zemirot, de chants et d'une ambiance chaleureuse ou chacun trouve sa place.",
      },
      {
        Icon: Sparkles,
        title: "Une atmosphere unique",
        description:
          "Un cadre base sur la fraternite, la Sim'ha et le respect, pour vivre pleinement la richesse du Chabbat.",
      },
    ],
    community: {
      eyebrow: "Une communaute",
      title: "Bien plus qu'un Chabbat",
      paragraphs: [
        "Les Chabbat Plein Bnei Yeshivot sont devenus au fil du temps un veritable point de rencontre pour la communaute francophone.",
        "Ils permettent de creer des liens entre jeunes issus de differentes Yechivot, de renforcer le sentiment d'appartenance et de construire une veritable communaute autour de la Torah. Chaque edition est une occasion de se retrouver, de se renforcer et de vivre ensemble des moments qui restent graves.",
      ],
    },
    audience: [
      "Bahourim francophones etudiant en Israel",
      "Etudiants souhaitant vivre un Chabbat de Torah dans une ambiance chaleureuse",
      "Jeunes souhaitant rencontrer d'autres francophones partageant les memes aspirations",
      "Familles et participants desirant rejoindre une dynamique communautaire forte",
    ],
    organisation: {
      title: "Une organisation au service des participants",
      description:
        "Pour offrir une experience de grande qualite, l'equipe de Bnei Yeshivot veille a chaque detail afin que chacun se concentre sur l'essentiel : la Torah, les rencontres et la fraternite.",
      items: [
        { Icon: ClipboardList, label: "Organisation generale" },
        { Icon: HandHeart, label: "Accueil des participants" },
        { Icon: BedDouble, label: "Hebergement" },
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
      title: "Vous souhaitez vivre un Chabbat different ?",
      text: "Un Chabbat ou la Torah, la fraternite et la communaute se rencontrent. Decouvrez les prochains Chabbat Plein Bnei Yeshivot et rejoignez une dynamique qui rassemble chaque annee de nombreux jeunes francophones.",
      primaryCta: "Decouvrir les prochains Chabbat Plein",
      primaryHref: "/evenements",
    },
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
        "Talmoudo Beyado donne un cadre clair : chaque Bahour choisit huit dapim dans la massehet qu'il etudie a la yeshiva, les revise, passe un mivhan mensuel, puis retrouve son suivi personnel dans son espace.",
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
    flow: [
      "L'admin fixe la date du prochain mivhan mensuel",
      "Le Bahour s'inscrit avec sa massehet et huit dapim",
      "Les inscriptions ferment automatiquement avant le mivhan",
      "Le Bahour passe le mivhan sur les dapim choisis",
      "L'equipe renseigne la note et la recompense",
      "Le resultat arrive par email et dans l'espace Bahour",
    ],
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
            Des images et un format court pour retrouver l&apos;ambiance du
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
                    Moments d&apos;etude, rencontres et ambiance du programme.
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
                    Moments d&apos;etude, rencontres et ambiance du programme.
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
                Le format video court du programme.
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
                  l&apos;annee des Rabbanim et intervenants reconnus qui viennent
                  transmettre leur Torah et partager leur experience.
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

        {slug === "talmoudo-beyado" ? (
          <section className="section band" id="inscription-talmoudo">
            <div className="container">
              <div className="section-header">
                <div>
                  <span className="eyebrow">Inscription</span>
                  <h2>Choisir sa massehet et ses huit dapim</h2>
                </div>
                <p>
                  L&apos;inscription se rattache au mivhan ouvert par
                  l&apos;administration. Un Bahour connecte n&apos;a plus qu&apos;a
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
                  Notre equipe peut vous accompagner dans la prochaine etape.
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
