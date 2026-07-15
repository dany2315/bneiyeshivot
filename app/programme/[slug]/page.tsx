import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../components";
import { getProgram, programmes } from "../programmes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BenHazmanimFranceMap } from "@/components/ben-hazmanim-france-map";
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
  CheckCircle2,
  MessageCircle,
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
};

type VisualGalleryAlbum = {
  title: string;
  description: string;
  photos: string[];
  videoUrl?: string;
};

const benHazmanimShortUrl =
  "https://www.youtube-nocookie.com/embed/kuM2P0GIs8o?rel=0&modestbranding=1&playsinline=1";

const benHazmanimGalleryAlbums: VisualGalleryAlbum[] = [
  {
    title: "Photos",
    description: "Moments d'etude, ambiance et rassemblements Ben Hazmanim.",
    photos: [
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    title: "Videos",
    description: "Courts formats, prises de parole et souvenirs du programme.",
    videoUrl: benHazmanimShortUrl,
    photos: [
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    title: "Communautes",
    description: "Les villes, Kehilot et groupes qui portent le reseau.",
    photos: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

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

function ProgramVisualGallery({ albums }: { albums: VisualGalleryAlbum[] }) {
  return (
    <section className="section band">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Galerie</span>
            <h2>Images et videos du reseau</h2>
          </div>
          <p>
            Une galerie pour retrouver les moments forts, les lieux et
            l&apos;ambiance des programmes Ben Hazmanim.
          </p>
        </div>
        <div className="gallery-grid">
          {albums.map((album, index) => (
            <Dialog key={album.title}>
              <DialogTrigger
                render={<button className="gallery-card-trigger" type="button" />}
              >
                <Card className="gallery-card">
                  <div className="gallery-card-mosaic">
                    {album.photos.slice(0, 5).map((photo, photoIndex) => (
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
                    <Badge variant={index % 2 === 0 ? "info" : "warning"}>
                      {album.videoUrl ? "Video" : `${album.photos.length} photos`}
                    </Badge>
                    <CardTitle>{album.title}</CardTitle>
                    <CardDescription>{album.description}</CardDescription>
                  </CardHeader>
                </Card>
              </DialogTrigger>
              <DialogContent className="gallery-dialog-content max-h-[92vh] overflow-y-auto sm:max-w-5xl">
                <DialogClose
                  render={
                    <Button
                      className="gallery-dialog-close"
                      size="sm"
                      variant="secondary"
                    />
                  }
                >
                  Fermer
                </DialogClose>
                <DialogHeader className="gallery-dialog-header">
                  <DialogTitle>{album.title}</DialogTitle>
                  <DialogDescription>{album.description}</DialogDescription>
                </DialogHeader>
                {album.videoUrl ? (
                  <div className="gallery-dialog-video">
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      src={album.videoUrl}
                      title={`${album.title} Ben Hazmanim`}
                    />
                  </div>
                ) : null}
                <div className="gallery-dialog-grid">
                  {album.photos.map((photo, photoIndex) => (
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
              </DialogContent>
            </Dialog>
          ))}
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
              <h1>{slug === "ben-hazmanim" ? "Yeshiva Ben Azmanim" : title}</h1>
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
          <ProgramVisualGallery albums={benHazmanimGalleryAlbums} />
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
