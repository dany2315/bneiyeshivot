export type PrototypeEvent = {
  slug: string;
  mode: "upcoming" | "past";
  cardVariant: 1 | 2 | 3;
  pageVariant: 1 | 2 | 3;
  title: string;
  eyebrow: string;
  description: string;
  body: string;
  date: string;
  location: string;
  capacity?: number;
  registrations: number;
  requiresRegistration: boolean;
  image: string;
  videos: string[];
  gallery: string[];
  afterGallery: string[];
};

const video = "https://www.youtube.com/embed/dQw4w9WgXcQ";

const people = [
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
];

const places = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
];

const study = [
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
];

export const prototypeEvents: PrototypeEvent[] = [
  {
    slug: "prototype-grand-chabbat",
    mode: "upcoming",
    cardVariant: 1,
    pageVariant: 1,
    title: "Grand Chabbat Bnei Yeshivot",
    eyebrow: "A venir",
    description:
      "Un Chabbat complet pour reunir les Bahourim francophones autour de repas, cours et moments de partage.",
    body:
      "Le Grand Chabbat rassemble les jeunes autour d'une ambiance chaleureuse, de repas organises, de cours inspires et d'un cadre pense pour creer une vraie dynamique de groupe avant et pendant l'annee en Israel.\n\nLe programme comprend l'accueil avant Chabbat, les repas en commun, des cours avec des Rabbanim, un oneg, des temps de questions-reponses et une havdala collective. La page doit permettre de comprendre rapidement l'ambiance, les horaires, le lieu et l'interet de l'inscription.",
    date: "Jeudi 22 aout 2026 - 18:30",
    location: "Jerusalem",
    capacity: 180,
    registrations: 74,
    requiresRegistration: true,
    image:
      "https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1400&q=80",
    videos: [video],
    gallery: [people[0], places[0], people[1], people[5], places[3], study[0]],
    afterGallery: [],
  },
  {
    slug: "prototype-ben-hazmanim",
    mode: "upcoming",
    cardVariant: 2,
    pageVariant: 2,
    title: "Ben Hazmanim France-Israel",
    eyebrow: "Programme vacances",
    description:
      "Des journees de Torah et d'activites pendant les vacances, avec plusieurs lieux et groupes.",
    body:
      "Le programme Ben Hazmanim propose un rythme clair : limoud le matin, activites l'apres-midi et rencontres avec des Rabbanim. L'objectif est de garder une dynamique forte pendant les periodes de pause.\n\nLa page doit pouvoir presenter plusieurs lieux, plusieurs horaires, une video de presentation, des photos d'ambiance et un appel a l'inscription. Le design doit rester lisible meme avec beaucoup d'informations.",
    date: "Dimanche 13 septembre 2026 - 10:00",
    location: "Paris, Lyon, Jerusalem",
    capacity: 260,
    registrations: 112,
    requiresRegistration: true,
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
    videos: [video, video],
    gallery: [study[0], people[2], study[1], people[4], places[1], study[2]],
    afterGallery: [],
  },
  {
    slug: "prototype-bayit-neeman",
    mode: "upcoming",
    cardVariant: 3,
    pageVariant: 3,
    title: "Soiree Bayit Neeman",
    eyebrow: "Accompagnement",
    description:
      "Une soiree de preparation et d'orientation autour de la construction du foyer.",
    body:
      "Bayit Neeman accompagne les jeunes avec discretion et serieux. Cette soiree reunit interventions, questions-reponses et ressources pratiques pour avancer avec clarte.\n\nLe design doit inspirer confiance : moins spectaculaire, plus elegant, avec une image forte, des blocs propres et une presentation claire du deroule. La video peut etre un extrait ou un message d'introduction.",
    date: "Mardi 6 octobre 2026 - 20:15",
    location: "Netanya",
    registrations: 38,
    requiresRegistration: true,
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80",
    videos: [video],
    gallery: [study[3], study[4], study[5], people[3], people[4], study[2]],
    afterGallery: [],
  },
  {
    slug: "prototype-chabbat-passe",
    mode: "past",
    cardVariant: 1,
    pageVariant: 1,
    title: "Chabbat d'integration",
    eyebrow: "Souvenirs",
    description:
      "Un Chabbat d'accueil pour les nouveaux arrivants, avec repas, chants et rencontres.",
    body:
      "Ce Chabbat a permis aux nouveaux Bahourim de rencontrer l'equipe, de poser leurs questions et de creer leurs premiers liens en Israel.\n\nPour un evenement passe, la page doit mettre les souvenirs en avant : galerie plus large, videos apres evenement, chiffres de participation, et une narration courte de ce qui s'est vecu.",
    date: "Chabbat 18 mai 2026",
    location: "Jerusalem",
    registrations: 145,
    requiresRegistration: false,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    videos: [video],
    gallery: [people[0], people[1], places[0]],
    afterGallery: [people[2], people[3], people[5], places[3], study[0], study[2]],
  },
  {
    slug: "prototype-voyage-passe",
    mode: "past",
    cardVariant: 2,
    pageVariant: 2,
    title: "Voyage dans le Nord",
    eyebrow: "Galerie",
    description:
      "Une journee de decouverte, limoud et cohesion dans le nord d'Israel.",
    body:
      "La sortie a combine visite, marche, moments de Torah et repas collectif. Les photos retracent l'ambiance du groupe et les temps forts de la journee.\n\nCe type de page doit donner envie de parcourir les souvenirs : une galerie dense, plusieurs videos, des images larges, et des informations pratiques conservees en archive.",
    date: "Lundi 3 juin 2026",
    location: "Galil",
    registrations: 92,
    requiresRegistration: false,
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
    videos: [video, video],
    gallery: [places[2], places[1], places[3]],
    afterGallery: [places[0], places[1], places[2], places[3], places[4], places[5]],
  },
  {
    slug: "prototype-talmoudo-passe",
    mode: "past",
    cardVariant: 3,
    pageVariant: 3,
    title: "Remise des prix Talmoudo Beyado",
    eyebrow: "Bilan",
    description:
      "Retour sur une remise de prix apres plusieurs mois de revision et de mivhanim.",
    body:
      "La remise des prix a mis a l'honneur les efforts constants des participants. La page detail permet d'afficher photos, videos de discours, bilan du programme et mise en avant des participants.\n\nCe design doit etre plus institutionnel : beau header, chiffres, galerie ordonnee et videos de prises de parole. Il doit rester propre sur mobile avec beaucoup de contenu.",
    date: "Jeudi 27 juin 2026",
    location: "Jerusalem",
    registrations: 210,
    requiresRegistration: false,
    image:
      "https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=1400&q=80",
    videos: [video],
    gallery: [study[3], study[4], people[2]],
    afterGallery: [study[0], study[1], study[2], study[3], study[4], study[5]],
  },
];

export function getPrototypeEvent(slug: string) {
  return prototypeEvents.find((event) => event.slug === slug);
}
