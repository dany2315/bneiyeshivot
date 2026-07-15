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
    title: "Beth Hamidrach - Leil Shishi",
    eyebrow: "Etude",
    description: "Un rendez-vous hebdomadaire autour de la Torah.",
    longDescription:
      "Chaque jeudi soir, un cadre chaleureux reunit pres de 60 jeunes francophones autour du Limoud, de la pratique et du partage. Plus qu'un Seder : une veritable experience de Torah.",
    focusLabel: "Au programme",
    ctaLabel: "Decouvrir le Beth Hamidrach",
    image: "/programmes/beth-hamidrach.jpeg",
    href: "/programme/beth-hamidrach",
    Icon: BookOpen,
    actions: [
      {
        title: "Etude",
        description: "Un temps de Limoud regulier dans une ambiance chaleureuse.",
        Icon: BookOpen,
      },
      {
        title: "Rabbanim invites",
        description: "Des interventions et echanges avec des Rabbanim.",
        Icon: School,
      },
      {
        title: "Ateliers Halakha",
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
      "Le plus grand reseau francophone de Yechivot Ben Hazmanim.",
    longDescription:
      "Un projet qui federe des Kehilot, des Rabbanim et des centaines de Bahourim autour d'une meme vision : offrir a chaque jeune un veritable Makom Torah pendant les vacances.",
    focusLabel: "Le reseau",
    ctaLabel: "Decouvrir le reseau Ben Hazmanim",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1100&q=82",
    href: "/programme/ben-hazmanim",
    Icon: Sparkles,
    actions: [
      {
        title: "Yechivot Ben Hazmanim",
        description: "Des centres d'etude actifs pendant les vacances.",
        Icon: Sparkles,
      },
      {
        title: "Kehilot partenaires",
        description: "Un reseau porte avec les communautes locales.",
        Icon: Users,
      },
      {
        title: "Makom Torah",
        description: "Un cadre serieux pour chaque Bahour francophone.",
        Icon: BookOpen,
      },
    ],
    stats: [
      { value: "+250", label: "Bahourim" },
      { value: "11", label: "centres d'etude" },
      { value: "10+", label: "Kehilot partenaires" },
      { value: "France & Israel", label: "reseau international" },
    ],
  },
  {
    slug: "talmoudo-beyado",
    title: "Talmoudo Beyado",
    eyebrow: "Revision",
    description: "Un programme de revision avec examens, suivi et bourses.",
    longDescription:
      "Talmoudo Beyado encourage l'etude reguliere, la revision et la progression personnelle a travers des objectifs, des examens et un suivi serieux.",
    focusLabel: "Le programme comprend",
    ctaLabel: "Decouvrir Talmoudo Beyado",
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1100&q=82",
    href: "/programme/talmoudo-beyado",
    Icon: ClipboardCheck,
    actions: [
      {
        title: "Mivhan mensuel",
        description: "Des examens pour mesurer les acquis et progresser.",
        Icon: ClipboardCheck,
      },
      {
        title: "Suivi personnel",
        description: "Un suivi pour encourager la regularite et la revision.",
        Icon: Users,
      },
      {
        title: "Encouragements",
        description: "Des objectifs d'etude et des encouragements concrets.",
        Icon: Gift,
      },
    ],
  },
  {
    slug: "shabbatot",
    title: "Shabbatot",
    eyebrow: "Communaute",
    description: "Des Chabbatot inoubliables, reunissant des centaines de jeunes.",
    longDescription:
      "Les Shabbatot organises par Bnei Yeshivot reunissent des jeunes et des familles autour de la Torah, de la convivialite et d'une ambiance exceptionnelle.",
    focusLabel: "Au programme",
    ctaLabel: "Decouvrir nos Shabbatot",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1100&q=82",
    href: "/programme/shabbatot",
    Icon: Users,
    actions: [
      {
        title: "Grands Chabbatot",
        description: "Des repas de Chabbat et des moments de fraternite.",
        Icon: Users,
      },
      {
        title: "Ambiance Torah",
        description: "Des etudes, conferences et divrei Torah.",
        Icon: BookOpen,
      },
      {
        title: "Lien communautaire",
        description: "Des rencontres dans une atmosphere chaleureuse.",
        Icon: Heart,
      },
    ],
  },
  {
    slug: "bayit-neeman",
    title: "Binian Adei Ad",
    eyebrow: "Foyer",
    description: "Accompagner les jeunes dans la construction de leur futur foyer.",
    longDescription:
      "Binian Adei Ad accompagne les jeunes francophones dans leur parcours vers la construction d'un foyer solide, avec un accompagnement serieux base sur les valeurs de la Torah.",
    focusLabel: "Accompagnement",
    ctaLabel: "Decouvrir Binian Adei Ad",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1100&q=82",
    href: "/programme/bayit-neeman",
    Icon: HomeIcon,
    actions: [
      {
        title: "Preparation",
        description: "Des reperes pour aborder cette etape avec maturite.",
        Icon: HomeIcon,
      },
      {
        title: "Accompagnement",
        description: "Une ecoute serieuse et adaptee aux besoins des jeunes.",
        Icon: Heart,
      },
      {
        title: "Valeurs",
        description: "Une construction guidee par la Torah et la responsabilite.",
        Icon: BookOpen,
      },
    ],
  },
  {
    slug: "chidoukhim",
    title: "Chidoukhim",
    eyebrow: "Accompagnement",
    description:
      "Un accompagnement serieux et discret pour les jeunes en age de se marier.",
    longDescription:
      "Chidoukhim propose un accompagnement base sur l'ecoute, la discretion et la confiance pour aider les jeunes a avancer dans leur recherche de leur futur conjoint.",
    focusLabel: "Objectif",
    ctaLabel: "En savoir plus",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1100&q=82",
    href: "/programme/chidoukhim",
    Icon: Heart,
    actions: [
      {
        title: "Discretion",
        description: "Un accompagnement respectueux et confidentiel.",
        Icon: Heart,
      },
      {
        title: "Ecoute",
        description: "Un cadre humain pour comprendre chaque situation.",
        Icon: Users,
      },
      {
        title: "Responsabilite",
        description: "Une demarche encadree avec serieux et confiance.",
        Icon: ClipboardCheck,
      },
    ],
  },
  {
    slug: "avrekhim",
    title: "Programme Avrekhim",
    eyebrow: "Avrekhim",
    description:
      "Accompagner les Avrekhim francophones en Israel.",
    longDescription:
      "Bnei Yeshivot accompagne egalement les Avrekhim francophones installes en Israel en developpant des cadres de Torah et une dynamique communautaire. Notre objectif est de permettre aux Avrekhim de continuer leur etude dans un environnement serieux, chaleureux et adapte, tout en renforcant les liens entre les familles francophones.",
    focusLabel: "Nos cadres",
    ctaLabel: "Decouvrir le Programme Avrekhim",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1100&q=82",
    href: "/programme/avrekhim",
    Icon: School,
    actions: [
      {
        title: "Kollel Erev Zikhron Eliyahou",
        description:
          "Un cadre d'etude regulier a Jerusalem qui rassemble actuellement 12 Avrekhim.",
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
