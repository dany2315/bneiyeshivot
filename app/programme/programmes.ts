import {
  BookOpen,
  ClipboardCheck,
  Gift,
  Heart,
  HomeIcon,
  Moon,
  School,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Program = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  longDescription: string;
  focusLabel: string;
  ctaLabel: string;
  image: string;
  href: string;
  Icon: LucideIcon;
  actions: Array<{
    title: string;
    description: string;
    Icon: LucideIcon;
  }>;
  stats?: Array<{
    value: string;
    label: string;
  }>;
};

export const programmes: Program[] = [
  {
    slug: "beth-hamidrach",
    title: "Beth Hamidrach",
    eyebrow: "Étude",
    description: "Un rendez-vous hebdomadaire où la Torah rassemble, élève et inspire.",
    longDescription:
      "Chaque jeudi soir, un cadre chaleureux réunit près de 60 jeunes francophones autour du Limoud, de la pratique et du partage. Plus qu’un Seder : une véritable expérience de Torah.",
    focusLabel: "Au programme",
    ctaLabel: "Découvrir le Beth Hamidrach",
    image: "/programmes/beth-hamidrach.jpeg",
    href: "/programme/beth-hamidrach",
    Icon: BookOpen,
    actions: [
      {
        title: "Seder Limoud",
        description: "Un temps de Limoud régulier dans une ambiance chaleureuse.",
        Icon: BookOpen,
      },
      {
        title: "Cours de Torah",
        description: "Des interventions et échanges avec des Rabbanim.",
        Icon: School,
      },
      {
        title: "Kumzits & collation",
        description: "Des ateliers pratiques et des rencontres entre jeunes.",
        Icon: Heart,
      },
    ],
  },
  {
    slug: "ben-hazmanim",
    title: "Ben Hazmanim",
    eyebrow: "Vacances",
    description:
      "Le plus grand réseau francophone de Yéchivot Ben Hazmanim.",
    longDescription:
      "Un projet qui fédère des Kehilot, des Rabbanim et des centaines de Bahourim autour d’une même vision : offrir à chaque jeune un véritable Makom Torah pendant les vacances.",
    focusLabel: "Le réseau",
    ctaLabel: "Découvrir le réseau Ben Hazmanim",
    image: "/programmes/ben-hazmanim.jpeg",
    href: "/programme/ben-hazmanim",
    Icon: Sparkles,
    actions: [
      {
        title: "Yéchivot Ben Hazmanim",
        description: "Des centres d’étude actifs pendant les vacances.",
        Icon: Sparkles,
      },
      {
        title: "Shiourim, activités & accompagnement",
        description: "Un réseau porté avec les communautés locales.",
        Icon: Users,
      },
      {
        title: "Des centaines de participants chaque année",
        description: "Un cadre sérieux pour chaque Bahour francophone.",
        Icon: BookOpen,
      },
    ],
    stats: [
      { value: "+300", label: "Bahourim par an" },
      { value: "11", label: "centres d’étude" },
      { value: "10+", label: "Kehilot partenaires" },
      { value: "France & Israël", label: "réseau international" },
    ],
  },
  {
    slug: "talmoudo-beyado",
    title: "Talmoudo Beyado",
    eyebrow: "Révision",
    description:
      "Réviser avec rigueur, progresser avec régularité et être récompensé pour son investissement.",
    longDescription:
      "Talmoudo Beyado encourage l’étude régulière, la révision et la progression personnelle à travers des objectifs, des examens et un suivi sérieux.",
    focusLabel: "Le programme comprend",
    ctaLabel: "Découvrir Talmoudo Beyado",
    image: "/programmes/talmoudo-beyado.jpeg",
    href: "/programme/talmoudo-beyado",
    Icon: ClipboardCheck,
    actions: [
      {
        title: "Examens mensuels",
        description: "Des examens pour mesurer les acquis et progresser.",
        Icon: ClipboardCheck,
      },
      {
        title: "Suivi personnalisé",
        description: "Un suivi pour encourager la régularité et la révision.",
        Icon: Users,
      },
      {
        title: "Bourses d’encouragement",
        description: "Des objectifs d’étude et des encouragements concrets.",
        Icon: Gift,
      },
    ],
  },
  {
    slug: "shabbatot",
    title: "Chabbat Plein",
    eyebrow: "Communauté",
    description:
      "Le rendez-vous incontournable de la jeunesse francophone : un Chabbat d’exception autour de la Torah, de la fraternité et de la Sim’ha.",
    longDescription:
      "Un Chabbat qui rassemble, une expérience qui marque, une communauté qui se construit.",
    focusLabel: "Au programme",
    ctaLabel: "Découvrir Chabbat Plein",
    image: "/programmes/shabbat-plein.jpeg",
    href: "/programme/shabbatot",
    Icon: Users,
    actions: [
      {
        title: "Des moments de Torah",
        description: "Cours, divrei Torah et interventions de Rabbanim.",
        Icon: BookOpen,
      },
      {
        title: "Repas & ambiance unique",
        description: "Des repas d’exception, des Zemirot et de la Sim’ha.",
        Icon: Heart,
      },
      {
        title: "Rencontres et fraternité",
        description: "Des liens durables entre jeunes francophones.",
        Icon: Users,
      },
    ],
  },
  {
    slug: "bayit-neeman",
    title: "Binian Adei Ad",
    eyebrow: "Foyer",
    description:
      "Accompagner les jeunes dans la construction d’un foyer fondé sur les valeurs de la Torah.",
    longDescription:
      "Binian Adei Ad accompagne les jeunes francophones dans leur parcours vers la construction d’un foyer solide, avec un accompagnement sérieux basé sur les valeurs de la Torah.",
    focusLabel: "Accompagnement",
    ctaLabel: "Découvrir Binian Adei Ad",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1100&q=82",
    href: "/programme/bayit-neeman",
    Icon: HomeIcon,
    actions: [
      {
        title: "Accompagnement personnalisé",
        description: "Des repères pour aborder cette étape avec maturité.",
        Icon: HomeIcon,
      },
      {
        title: "Conseils & orientation",
        description: "Une écoute sérieuse et adaptée aux besoins des jeunes.",
        Icon: Heart,
      },
      {
        title: "Suivi avant et après le mariage",
        description: "Une construction guidée par la Torah et la responsabilité.",
        Icon: BookOpen,
      },
    ],
  },
  {
    slug: "chidoukhim",
    title: "Chidoukhim",
    eyebrow: "Accompagnement",
    description:
      "Un accompagnement sérieux, discret et humain pour aider chaque jeune à construire son avenir.",
    longDescription:
      "Chidoukhim propose un accompagnement basé sur l’écoute, la discrétion et la confiance pour aider les jeunes à avancer dans leur recherche de leur futur conjoint.",
    focusLabel: "Objectif",
    ctaLabel: "Découvrir le programme",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1100&q=82",
    href: "/programme/chidoukhim",
    Icon: Heart,
    actions: [
      {
        title: "Accompagnement personnalisé",
        description: "Un accompagnement respectueux et confidentiel.",
        Icon: Heart,
      },
      {
        title: "Mise en relation",
        description: "Un cadre humain pour comprendre chaque situation.",
        Icon: Users,
      },
      {
        title: "Suivi confidentiel",
        description: "Une démarche encadrée avec sérieux et confiance.",
        Icon: ClipboardCheck,
      },
    ],
  },
  {
    slug: "avrekhim",
    title: "Programme Avrekhim",
    eyebrow: "Avrekhim",
    description:
      "Accompagner les Avrekhim francophones en Israël.",
    longDescription:
      "Bnei Yeshivot accompagne également les Avrekhim francophones installés en Israël en développant des cadres de Torah et une dynamique communautaire. Notre objectif est de permettre aux Avrekhim de continuer leur étude dans un environnement sérieux, chaleureux et adapté, tout en renforçant les liens entre les familles francophones.",
    focusLabel: "Nos cadres",
    ctaLabel: "Découvrir le Programme Avrekhim",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1100&q=82",
    href: "/programme/avrekhim",
    Icon: School,
    actions: [
      {
        title: "Kollel Erev Zikhron Eliyahou",
        description:
          "Un cadre d’étude régulier à Jérusalem qui rassemble actuellement 12 Avrekhim.",
        Icon: BookOpen,
      },
      {
        title: "Kollel Chichi Ohel Yaacov",
        description:
          "Un rendez-vous hebdomadaire autour de la Torah qui rassemble actuellement 10 Avrekhim.",
        Icon: Moon,
      },
      {
        title: "Vie communautaire",
        description:
          "Des rencontres et moments de partage pour renforcer les liens entre familles francophones.",
        Icon: Heart,
      },
    ],
  },
];

export function getProgram(slug: string) {
  return programmes.find((program) => program.slug === slug);
}
