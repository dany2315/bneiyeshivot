import Link from "next/link";
import Image from "next/image";
import { PageShell } from "../components";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";

export const metadata = {
  title: "Services",
};

const pageServices = [
  {
    title: "Assurance maladie",
    description:
      "Nous accompagnons gratuitement les étudiants dans leurs démarches auprès des caisses d'assurance maladie israéliennes.",
    action: "Faire une demande",
    href: "/demandes/koupat-holim",
    learnMoreHref: "/services/assurance-maladie",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Visa étudiant",
    description:
      "Nous vous accompagnons dans toutes les démarches pour obtenir ou renouveler votre visa étudiant.",
    action: "Deposer un dossier",
    href: "/demandes/visa",
    learnMoreHref: "/services/visa-etudiant",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "ETA-IL",
    description:
      "Nous vous aidons à effectuer votre demande d'autorisation d'entree en Israël.",
    action: "Commencer ma demande",
    href: "https://israel-entry.piba.gov.il/apply-for-an-eta-il-1",
    learnMoreHref: "/services/eta-il",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Installation en Israël",
    description:
      "Toutes les informations essentielles avant votre arrivée : checklist, téléphone, banque, assurance, transport et administratif.",
    action: "Je prépare mon arrivée",
    href: "/services",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Boutique Literie",
    description:
      "Commandez votre pack complet avant votre arrivée en Israël : oreiller, couette, draps, housse et protege-matelas selon les packs.",
    action: "Voir la boutique",
    href: "/boutique",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Guide PDF",
    description:
      "Tout ce qu'il faut savoir avant de venir étudier en Israël dans un guide complet téléchargeable.",
    action: "Télécharger gratuitement",
    href: "/guide",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
];

export default function ServicesPage() {
  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Accompagnement</span>
            <h1>Services</h1>
            <p>
              Des services concrets pour preparer votre arrivee, regulariser
              vos demarches et garder un accompagnement fiable tout au long de
              votre installation en Israel.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Choisir un service</h2>
              <p>
                Assurance maladie, visa, ETA-IL, installation, boutique et guide
                pratique : chaque parcours vous oriente vers la bonne action au
                bon moment.
              </p>
            </div>
            <div className="service-showcase">
              {pageServices.map(({ title, description, action, href, learnMoreHref, image }) => (
                <Card className="service-card" key={title}>
                  <div className="service-card-image">
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(max-width: 980px) 100vw, 50vw"
                    />
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

        <section className="section band">
          <div className="container split">
            <div>
              <span className="eyebrow">Suivi simple</span>
              <h2>Un dossier clair pour chaque demande</h2>
              <p>
                Chaque demande administrative pourra etre suivie par le Bahour :
                statut, documents manquants, messages de l&apos;équipe et actions
                a completer.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Parcours type</CardTitle>
                <CardDescription>
                  Depot de demande, upload des pieces, verification admin,
                  relance si besoin, puis suivi depuis l&apos;Espace Bahour.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/demandes/visa">Faire une demande visa</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/client">Espace Bahour</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
