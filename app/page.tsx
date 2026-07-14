import Link from "next/link";
import Image from "next/image";
import { PageShell } from "./components";
import { events, impactStats } from "./data";
import { programmes } from "./programme/programmes";
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  CheckCircle2,
  Film,
  Gift,
  Heart,
  Info,
  School,
  ShoppingBasket,
} from "lucide-react";

const homeVideoUrl =
  "https://www.youtube-nocookie.com/embed/c0PKxmIQlSQ?rel=0&modestbranding=1&playsinline=1";

const homeServices = [
  {
    title: "Assurance maladie",
    description:
      "Nous accompagnons gratuitement les etudiants dans leurs demarches aupres des caisses d'assurance maladie israeliennes.",
    action: "Faire une demande",
    href: "/demandes/koupat-holim",
    learnMoreHref: "/services/assurance-maladie",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Visa etudiant",
    description:
      "Nous vous accompagnons dans toutes les demarches pour obtenir ou renouveler votre visa etudiant.",
    action: "Deposer un dossier",
    href: "/demandes/visa",
    learnMoreHref: "/services/visa-etudiant",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "ETA-IL",
    description:
      "Nous vous aidons a effectuer votre demande d'autorisation d'entree en Israel.",
    action: "Commencer ma demande",
    href: "https://israel-entry.piba.gov.il/",
    learnMoreHref: "/services/eta-il",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Installation en Israel",
    description:
      "Toutes les informations essentielles avant votre arrivee : checklist, telephone, banque, assurance, transport et administratif.",
    action: "Je prepare mon arrivee",
    href: "/services",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Boutique Literie",
    description:
      "Commandez votre pack complet avant votre arrivee en Israel : oreiller, couette, draps, housse et protege-matelas selon les packs.",
    action: "Voir la boutique",
    href: "/boutique",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Guide PDF",
    description:
      "Tout ce qu'il faut savoir avant de venir etudier en Israel dans un guide complet telechargeable.",
    action: "Telecharger gratuitement",
    href: "/guide",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
];

const galleryItems = [
  "Photos",
  "Videos",
  "Drone",
  "Evenements",
  "Voyages",
  "Cours",
  "Shabbatot",
];

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

export default function Home() {
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
                  <Link href="/demandes/visa">Je viens etudier en Israel</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/dons">Faire un don</Link>
                </Button>
                <Button asChild size="lg">
                  <Link href="/client">Suivre ma demande</Link>
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
                  Une presentation claire de l'accompagnement Bnei Yeshivot,
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
                programmes pendant l'annee.
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
                Avant l'arrivee comme pendant l'annee, notre equipe vous
                accompagne dans les demarches qui comptent pour vous installer
                sereinement et garder un lien clair avec Bnei Yeshivot.
              </p>
            </div>
            <div className="service-showcase">
              {homeServices.map(({ title, description, action, href, learnMoreHref, image }) => (
                <Card className="service-card" key={title}>
                  <div className="service-card-image">
                    <Image src={image} alt="" fill sizes="(max-width: 980px) 100vw, 33vw" />
                  </div>
                  <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap justify-end gap-2">
                    {learnMoreHref ? (
                      <Button asChild variant="ghost">
                        <Link href={learnMoreHref}>
                          <Info className="size-4 sm:hidden" />
                          <span className="hidden sm:inline">En savoir plus</span>
                          <span className="sr-only sm:hidden">En savoir plus</span>
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
                      {title === "Programme Avrekhim" ? (
                        <ul className="program-card-list">
                          {actions.map((action) => (
                            <li key={action.title}>
                              <CheckCircle2 className="size-4" />
                              <span>{action.title}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
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
                Une galerie moderne pour mettre en avant photos, videos, drone,
                evenements, voyages, cours et Shabbatot.
              </p>
            </div>
            <div className="gallery-grid">
              {galleryItems.map((item, index) => (
                <Card className="gallery-card" key={item}>
                  <CardHeader>
                    <Badge variant={index % 2 === 0 ? "info" : "warning"}>
                      Galerie
                    </Badge>
                    <CardTitle>{item}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="section-header">
              <h2>Les prochains evenements</h2>
              <p>
                Une section dynamique pour annoncer les prochaines rencontres
                et permettre les inscriptions.
              </p>
            </div>
            <div className="grid grid-3">
              {events.map((event) => (
                <Card key={event.title}>
                  <CardHeader>
                    <Badge variant="info">{event.date}</Badge>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="secondary">{event.title.includes("Ben") ? "Voir le programme" : event.title.includes("Chabbat") ? "Reserver" : "S'inscrire"}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  Bons d'achat pour les familles
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
                  Grace a l'engagement de ses membres, Bnei Yeshivot developpe
                  des actions concretes tout au long de l'annee.
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
