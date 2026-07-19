import Link from "next/link";
import Image from "next/image";
import { PageShell } from "./components";
import { impactStats } from "./data";
import { programmes } from "./programme/programmes";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/event-content";
import { fileUrl } from "@/lib/files";
import { ImpactCounter } from "@/components/impact-counter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  CheckCircle2,
  ArrowRight,
  CalendarDays,
  Film,
  Gift,
  Heart,
  XIcon,
  MapPin,
  School,
  ShoppingBasket,
} from "lucide-react";

const homeVideoUrl =
  "https://www.youtube-nocookie.com/embed/c0PKxmIQlSQ?rel=0&modestbranding=1&playsinline=1";

const homeServices = [
  {
    title: "Assurance maladie",
    subtitle: "Votre couverture santé en Israël, sans stress.",
    description:
      "Nous vous accompagnons gratuitement dans toutes vos démarches afin d'obtenir rapidement votre assurance maladie.",
    action: "Faire une demande",
    href: "/demandes/koupat-holim",
    learnMoreHref: "/services/assurance-maladie",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Visa etudiant",
    subtitle: "Étudiez en Israël en toute sérénité.",
    description:
      "De la première demande au renouvellement, notre équipe vous accompagne à chaque étape de votre dossier.",
    action: "Déposer mon dossier",
    href: "/demandes/visa",
    learnMoreHref: "/services/visa-etudiant",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "ETA-IL",
    subtitle: "Préparez votre entrée en Israël en quelques clics.",
    description:
      "Nous vous guidons pour effectuer votre demande d'ETA-IL rapidement et sans erreur.",
    action: "Commencer ma demande",
    href: "https://israel-entry.piba.gov.il/apply-for-an-eta-il-1",
    learnMoreHref: "/services/eta-il",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Installation en Israël",
    subtitle: "Tout ce qu'il faut pour bien démarrer votre nouvelle vie.",
    description:
      "Retrouvez toutes les informations essentielles pour préparer sereinement votre arrivée en Israël.",
    action: "Préparer mon arrivée",
    href: "/services",
    learnMoreHref: "/services",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Boutique Literie",
    subtitle: "Installez-vous dès votre arrivée.",
    description:
      "Commandez votre kit de literie complet et retrouvez un logement prêt à vous accueillir.",
    action: "Voir la boutique",
    href: "/boutique",
    learnMoreHref: "/boutique",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Guide PDF",
    subtitle: "Le guide indispensable des étudiants francophones.",
    description:
      "Toutes les réponses à vos questions réunies dans un guide pratique, complet et gratuit.",
    action: "Télécharger gratuitement",
    href: "/guide",
    learnMoreHref: "/guide",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
];

type HomeGalleryMedia = {
  id: string;
  type: "IMAGE" | "VIDEO" | "YOUTUBE";
  src: string;
};

type HomeGalleryAlbum = {
  title: string;
  description: string;
  items: HomeGalleryMedia[];
};

const galleryAlbums = [
  {
    title: "Photos",
    description: "Moments de vie, rencontres et ambiance Bnei Yeshivot.",
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
    description: "Captures de cours, prises de parole et moments forts.",
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
    title: "Evenements",
    description: "Soirees, rassemblements et rendez-vous communautaires.",
    photos: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    title: "Voyages",
    description: "Sorties, decouvertes et temps forts en Israel.",
    photos: [
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1549989476-69a92fa57c36?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519817914152-22d216bb9170?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    title: "Cours",
    description: "Etude, ateliers et accompagnement personnel.",
    photos: [
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    title: "Shabbatot",
    description: "Ambiance, repas et moments de partage.",
    photos: [
      "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

function GalleryMedia({
  item,
  className,
}: {
  item: HomeGalleryMedia;
  className?: string;
}) {
  if (item.type === "VIDEO") {
    return (
      <video
        className={className}
        controls={false}
        muted
        playsInline
        preload="metadata"
        src={item.src}
      />
    );
  }

  if (item.type === "YOUTUBE") {
    return (
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={className}
        referrerPolicy="strict-origin-when-cross-origin"
        src={item.src}
        title="Video galerie"
      />
    );
  }

  return (
    <Image
      alt=""
      className={className}
      fill
      sizes="(max-width: 980px) 50vw, 20vw"
      src={item.src}
    />
  );
}

const testimonials = [
  {
    name: "Rav D.",
    role: "Rav accompagnateur",
    quote:
      "Bnei Yeshivot donne aux jeunes un cadre clair, chaleureux et serieux pour avancer en Israel.",
    tag: "Rabbanim",
  },
  {
    name: "Yaakov B.",
    role: "Bahour",
    quote:
      "J'ai pu gerer mes demarches et rejoindre les programmes sans me perdre dans l'administratif.",
    tag: "Bahourim",
  },
  {
    name: "Famille C.",
    role: "Parents",
    quote:
      "Le suivi nous a rassures avant le depart et pendant l'installation de notre fils.",
    tag: "Parents",
  },
  {
    name: "Ariel M.",
    role: "Ancien participant",
    quote:
      "Les Chabbatot, les cours et le lien avec l'equipe m'ont marque durablement.",
    tag: "Anciens",
  },
];

export default async function Home() {
  const [upcomingEvents, dbGalleryAlbums] = await Promise.all([
    prisma.event.findMany({
      where: { startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 3,
    }),
    prisma.homeGalleryAlbum.findMany({
      where: { active: true },
      include: {
        items: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }).catch(() => []),
  ]);
  const homeGalleryAlbums: HomeGalleryAlbum[] =
    dbGalleryAlbums.length > 0
      ? dbGalleryAlbums
          .map((album) => ({
            title: album.title,
            description: album.description,
            items: album.items
              .map((item) => ({
                id: item.id,
                type: item.type,
                src:
                  item.type === "YOUTUBE"
                    ? item.url
                    : fileUrl(item.key) ?? null,
              }))
              .filter(
                (item): item is HomeGalleryMedia =>
                  Boolean(item.src) &&
                  (item.type === "IMAGE" ||
                    item.type === "VIDEO" ||
                    item.type === "YOUTUBE"),
              ),
          }))
          .filter((album) => album.items.length > 0)
      : galleryAlbums.map((album) => ({
          title: album.title,
          description: album.description,
          items: album.photos.map((photo, index) => ({
            id: `${album.title}-${index}`,
            type: "IMAGE" as const,
            src: photo,
          })),
        }));

  return (
    <PageShell>
      <main>
        <section className="hero">
          <div className="container hero-inner">
            <div>
              <Image
                src="/logo-bnei.png"
                alt="Bnei Yeshivot"
                width={628}
                height={527}
                className="hero-logo"
                priority
              />
              <span className="eyebrow">France - Israel</span>
              <h1>Bnei Yeshivot</h1>
              <p>
                La plateforme de reference pour accompagner les etudiants,
                bahourim, avrekhim et familles francophones : demarches,
                programmes Torah, evenements, dons et Espace Bahour.
              </p>
              <div className="hero-actions">
                <Button asChild variant="accent" size="lg">
                  <Link href="/venir-etudier">Je viens etudier en Israel</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/dons">Faire un don</Link>
                </Button>
                <Button asChild size="lg">
                  <Link href="/inscription">M&apos;inscrire</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/dvar-torah">Dvar Torah de la semaine</Link>
                </Button>
              </div>
            </div>
            <Card className="hero-panel hero-journey-card">
              <CardHeader className="p-3 pb-2">
                <CardTitle>Parcours nouvel arrivant</CardTitle>
              </CardHeader>
              <ul className="journey-list">
                <li>
                  <span>Visa etudiant</span>
                  <Badge variant="warning">Formulaire</Badge>
                </li>
                <li>
                  <span>Koupat Holim</span>
                  <Badge variant="warning">Formulaire</Badge>
                </li>
                <li>
                  <span>ETA-IL</span>
                  <Badge variant="info">Site officiel</Badge>
                </li>
                <li>
                  <span>Kit literie</span>
                  <Badge variant="success">Boutique</Badge>
                </li>
              </ul>
            </Card>
            <Card className="hero-video-card hero-video-card-mobile">
              <CardContent className="p-2">
                <div className="home-video-player hero-video-player overflow-hidden" aria-label="Video de presentation">
                  <iframe
                    src={homeVideoUrl}
                    title="Video de presentation Bnei Yeshivot"
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="video-section video-section-desktop">
          <div className="container">
            <div className="home-video-frame">
              <div className="home-video-copy">
                <span className="eyebrow">Video de presentation</span>
                <h2>Decouvrir Bnei Yeshivot en quelques minutes</h2>
                <p>
                  Une presentation claire de l&apos;accompagnement Bnei Yeshivot,
                  des services et de la vision portee pour les jeunes
                  francophones en Israel.
                </p>
              </div>
              <div className="home-video-player overflow-hidden" aria-label="Video de presentation">
                <iframe
                  src={homeVideoUrl}
                  title="Video de presentation Bnei Yeshivot"
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Notre impact</h2>
              <p>
                Chaque chiffre represente une action concrete menee aupres des
                jeunes francophones : accueil, demarches, installation et
                programmes pendant l&apos;annee.
              </p>
            </div>
            <div className="grid grid-4">
              {impactStats.map(([value, label]) => (
                <ImpactCounter value={value} label={label} key={label} />
              ))}
            </div>
          </div>
        </section>

        <section className="section band" id="services">
          <div className="container">
            <div className="section-header">
              <h2>Nos services</h2>
              <p>
                Avant l&apos;arrivee comme pendant l&apos;annee, notre equipe vous
                accompagne dans les demarches qui comptent pour vous installer
                sereinement et garder un lien clair avec Bnei Yeshivot.
              </p>
            </div>
            <div className="service-showcase">
              {homeServices.map(({ title, subtitle, description, action, href, learnMoreHref, image }) => (
                <Card className="service-card" key={title}>
                  <div className="service-card-image">
                    <Image src={image} alt="" fill sizes="(max-width: 980px) 100vw, 33vw" />
                  </div>
                  <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>
                      <strong>{subtitle}</strong>
                      <span>{description}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap justify-end gap-2">
                    {learnMoreHref ? (
                      <Button asChild variant="default">
                        <Link href={learnMoreHref}>
                          En savoir plus
                        </Link>
                      </Button>
                    ) : null}
                    <Button asChild variant="secondary">
                      <Link href={href}>{action}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Nos programmes</h2>
              <p>
                Les differents poles de Bnei Yeshivot : etude, vacances,
                examens, Chabbatot et accompagnement personnel.
              </p>
            </div>
            <div className="grid grid-3">
              {programmes.map(({ title, description, href, ctaLabel, actions, Icon }, index) => (
                <Card
                  className="group relative min-h-[220px] overflow-hidden border-[rgba(6,40,70,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] p-0 shadow-[0_18px_48px_rgba(6,40,70,0.045)] transition hover:-translate-y-1 hover:border-[rgba(242,99,0,0.22)] hover:shadow-[0_26px_70px_rgba(6,40,70,0.09)]"
                  key={title}
                >
                  <CardHeader className="relative z-10 gap-5 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm font-black text-[var(--accent)]">
                        0{index + 1}
                      </span>
                      <span className="grid size-11 place-items-center rounded-2xl border border-[rgba(242,99,0,0.14)] bg-white text-[var(--accent)] shadow-sm transition group-hover:bg-[var(--accent-soft)]">
                        <Icon className="size-5" />
                      </span>
                    </div>
                    <div className="grid gap-3">
                      <CardTitle className="text-[26px] leading-none">
                        {title}
                      </CardTitle>
                      <CardDescription className="text-base leading-7">
                        {description}
                      </CardDescription>
                      <ul className="program-card-list">
                        {actions.map((action) => (
                          <li key={action.title}>
                            <CheckCircle2 className="size-4" />
                            <span>{action.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 px-6 pb-6 pt-0">
                    <Button asChild variant="secondary">
                      <Link href={href}>{ctaLabel}</Link>
                    </Button>
                  </CardContent>
                  <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 transition group-hover:opacity-60" />
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="section-header">
              <h2>Galerie</h2>
              <p>
                Une galerie moderne pour mettre en avant photos, videos,
                evenements, voyages, cours et Shabbatot.
              </p>
            </div>
            <div className="gallery-grid">
              {homeGalleryAlbums.map((album, index) => (
                <Dialog key={album.title}>
                  <DialogTrigger
                    render={
                      <button className="gallery-card-trigger" type="button" />
                    }
                  >
                    <Card className="gallery-card">
                      <div className="gallery-card-mosaic">
                        {album.items.slice(0, 5).map((item, photoIndex) => (
                          <div
                            key={item.id}
                            className={
                              photoIndex === 0
                                ? "gallery-mosaic-cell gallery-mosaic-main"
                                : "gallery-mosaic-cell"
                            }
                          >
                            <GalleryMedia item={item} />
                          </div>
                        ))}
                      </div>
                      <CardHeader>
                        <Badge variant={index % 2 === 0 ? "info" : "warning"}>
                          {album.items.length} media(s)
                        </Badge>
                        <CardTitle>{album.title}</CardTitle>
                        <CardDescription>{album.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </DialogTrigger>
                  <DialogContent
                    showCloseButton={false}
                    className="gallery-dialog-content max-h-[92vh] overflow-hidden p-0 sm:max-w-5xl"
                  >
                    <DialogHeader className="gallery-dialog-header">
                      <div className="grid gap-2">
                        <DialogTitle>{album.title}</DialogTitle>
                        <DialogDescription>{album.description}</DialogDescription>
                      </div>
                      <DialogClose
                        render={
                          <Button
                            aria-label="Fermer"
                            variant="ghost"
                            size="icon-sm"
                          />
                        }
                      >
                        <XIcon className="size-4" />
                      </DialogClose>
                    </DialogHeader>
                    <div className="gallery-dialog-scroll">
                      <div className="gallery-dialog-grid">
                      {album.items.map((item, photoIndex) => (
                        <div
                          className={
                            photoIndex === 0
                              ? "gallery-dialog-photo gallery-dialog-photo-featured"
                              : "gallery-dialog-photo"
                          }
                          key={item.id}
                        >
                          <GalleryMedia
                            className={
                              item.type === "YOUTUBE" || item.type === "VIDEO"
                                ? "absolute inset-0 h-full w-full object-cover"
                                : undefined
                            }
                            item={item}
                          />
                        </div>
                      ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="section-header">
              <div>
                <h2>Les prochains evenements</h2>
              </div>
              <Button asChild variant="secondary">
                <Link href="/evenements">Voir tout</Link>
              </Button>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-3">
                {upcomingEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="group overflow-hidden border-[var(--border)] bg-white pt-0 shadow-[0_22px_70px_rgba(6,40,70,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(6,40,70,0.12)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--primary-soft)]">
                      {fileUrl(event.imageKey) ? (
                        <Image
                          alt=""
                          className="object-cover transition duration-500 group-hover:scale-105"
                          fill
                          sizes="(max-width: 980px) 100vw, 33vw"
                          src={fileUrl(event.imageKey) ?? ""}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white">
                          <CalendarDays className="size-10 opacity-85" />
                        </div>
                      )}
                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <Badge variant="info">{formatDateTime(event.startsAt)}</Badge>
                        {event.requiresRegistration && (
                          <Badge variant="success">Inscription</Badge>
                        )}
                      </div>
                    </div>
                    <CardHeader className="gap-3">
                      <CardTitle className="text-2xl">{event.title}</CardTitle>
                      <CardDescription>{event.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
                        <MapPin className="size-4" />
                        {event.location || "Lieu a confirmer"}
                      </span>
                      <Button asChild variant={event.requiresRegistration ? "accent" : "secondary"}>
                        <Link href={event.requiresRegistration ? "/evenements" : "/contact"}>
                          {event.requiresRegistration ? "S'inscrire" : "Contactez-nous"}
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-base text-[var(--muted)]">
                  Aucun evenement a venir pour le moment.
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Temoignages</h2>
              <p>
                Une dizaine de temoignages videos : Rabbanim, Bahourim,
                parents et anciens participants.
              </p>
            </div>
            <Carousel
              className="testimonial-carousel"
              opts={{ align: "start", loop: true }}
            >
              <CarouselContent>
                {testimonials.map((testimonial) => (
                  <CarouselItem
                    className="basis-full md:basis-1/2 lg:basis-1/3"
                    key={testimonial.name}
                  >
                    <Card className="testimonial-card">
                      <CardHeader>
                        <div className="testimonial-topline">
                          <span className="testimonial-avatar">
                            {testimonial.name.slice(0, 1)}
                          </span>
                          <span className="testimonial-video">
                            <Film className="size-4" />
                            Video
                          </span>
                        </div>
                        <CardDescription className="testimonial-quote">
                          &quot;{testimonial.quote}&quot;
                        </CardDescription>
                        <div className="testimonial-author">
                          <strong>{testimonial.name}</strong>
                          <span>{testimonial.role}</span>
                        </div>
                        <Badge variant="info">{testimonial.tag}</Badge>
                      </CardHeader>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 z-10 bg-white/90 shadow-md backdrop-blur" />
              <CarouselNext className="right-2 z-10 bg-white/90 shadow-md backdrop-blur" />
            </Carousel>
          </div>
        </section>

        <section className="section band kesher-home">
          <div className="container donation-home-inner">
            <div>
              <span className="eyebrow">Kesher Nitsri</span>
              <h2>Une communaute engagee</h2>
              <p>
                Ensemble, faisons grandir la solidarite francophone en Israel.
                Kesher Nitsri est la communaute des personnes qui souhaitent
                soutenir durablement les actions de Bnei Yeshivot.
              </p>
              <ul className="donation-list kesher-home-list">
                <li>
                  <Gift className="size-4" />
                  Distributions pour les fetes
                </li>
                <li>
                  <ShoppingBasket className="size-4" />
                  Bons d&apos;achat pour les familles
                </li>
                <li>
                  <School className="size-4" />
                  Fournitures scolaires
                </li>
                <li>
                  <Heart className="size-4" />
                  Actions de solidarite
                </li>
              </ul>
              <Button asChild variant="accent" size="lg">
                <Link href="/kesher-nitsri">Rejoindre Kesher Nitsri</Link>
              </Button>
            </div>
            <Card className="program-highlight-card">
              <CardHeader>
                <CardTitle>Soutenir les jeunes, les Avrekhim et les familles</CardTitle>
                <CardDescription>
                  Grace a l&apos;engagement de ses membres, Bnei Yeshivot developpe
                  des actions concretes tout au long de l&apos;annee.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="section donation-home">
          <div className="container donation-home-inner">
            <div className="donation-visual">
              <Image
                src="/logo-bnei-cropped.png"
                alt="Bnei Yeshivot"
                width={628}
                height={527}
              />
            </div>
            <div>
              <span className="eyebrow">Faire un don</span>
              <h2>Ensemble, construisons l&apos;avenir des jeunes francophones.</h2>
              <p>
                Votre soutien permet de financer les programmes Torah, les aides
                administratives, les Shabbatot, les kits d&apos;installation et
                les etudiants en difficulte.
              </p>
              <ul className="donation-list">
                {[
                  "Programmes Torah",
                  "Aides administratives",
                  "Shabbatot",
                  "Kits d'installation",
                  "Etudiants en difficulte",
                ].map((item) => (
                  <li key={item}>
                    <CheckCircle2 className="size-4" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild variant="accent" size="lg">
                <Link href="/dons">
                  <Heart className="size-5" />
                  Je fais un don
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
