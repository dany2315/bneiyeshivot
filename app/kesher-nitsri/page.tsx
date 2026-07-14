import Link from "next/link";
import { PageShell } from "../components";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Gift,
  Heart,
  Megaphone,
  School,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Kesher Nitsri",
  description:
    "Kesher Nitsri, la communaute engagee qui soutient les actions de Bnei Yeshivot.",
};

const actions = [
  {
    title: "Soutien aux familles lors des fetes",
    description:
      "Organisation de distributions de colis alimentaires et de produits necessaires pour les Yamim Tovim.",
    Icon: Gift,
  },
  {
    title: "Distribution de bons d'achat",
    description:
      "Une aide concrete pour permettre aux familles de repondre a leurs besoins selon leur situation.",
    Icon: ShoppingBasket,
  },
  {
    title: "Fournitures scolaires",
    description:
      "Des distributions de materiel scolaire pour accompagner les familles avant la rentree.",
    Icon: School,
  },
  {
    title: "Actions de solidarite",
    description:
      "Un soutien aux familles francophones selon les besoins et les possibilites de l'association.",
    Icon: Heart,
  },
];

const benefits = [
  "Informations en avant-premiere sur les actions et projets",
  "Acces prioritaire lorsque le nombre de places est limite",
  "Priorite lors de certaines operations de solidarite",
  "Invitations a des rencontres, conferences et evenements reserves aux membres",
  "Lien privilegie avec l'equipe et les projets developpes toute l'annee",
];

export default function KesherNitsriPage() {
  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Kesher Nitsri</span>
            <h1>Une communaute engagee au service de la communaute francophone en Israel</h1>
            <p>
              Kesher Nitsri rassemble les personnes qui souhaitent soutenir
              durablement les actions de Bnei Yeshivot et participer a construire
              une communaute francophone plus forte, plus solidaire et plus
              engagee.
            </p>
            <div className="hero-actions">
              <Button asChild variant="accent" size="lg">
                <Link href="/dons">Rejoindre Kesher Nitsri</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/dons">Mettre en place mon soutien mensuel</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container split">
            <div>
              <span className="eyebrow">Pourquoi rejoindre ?</span>
              <h2>Votre engagement permet de developper des actions concretes</h2>
              <p>
                En rejoignant Kesher Nitsri, vous ne faites pas seulement un don :
                vous devenez partenaire de projets qui accompagnent les jeunes,
                les Avrekhim et les familles francophones en Israel.
              </p>
            </div>
            <Card className="program-highlight-card">
              <CardHeader>
                <span className="icon-box">
                  <Sparkles className="size-5" />
                </span>
                <CardTitle>A partir de 80 shekels par mois</CardTitle>
                <CardDescription>
                  Votre soutien regulier permet a Bnei Yeshivot de prevoir ses
                  actions sur le long terme, developper de nouveaux projets et
                  repondre davantage aux besoins de la communaute.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="section-header">
              <h2>Les actions soutenues</h2>
              <p>
                Kesher Nitsri rend possibles des actions de solidarite menees
                tout au long de l'annee.
              </p>
            </div>
            <div className="grid grid-4">
              {actions.map(({ title, description, Icon }) => (
                <Card className="program-action-card" key={title}>
                  <CardHeader>
                    <span className="icon-box">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container split">
            <Card className="program-highlight-card">
              <CardHeader>
                <span className="icon-box">
                  <Megaphone className="size-5" />
                </span>
                <CardTitle>Un lien privilegie avec les actions</CardTitle>
                <CardDescription>
                  Les membres integrent une communaute engagee et suivent les
                  projets developpes par Bnei Yeshivot au fil de l'annee.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="about-check-list">
                  {benefits.map((benefit) => (
                    <li key={benefit}>
                      <Heart className="size-4" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <div>
              <span className="eyebrow">Ensemble</span>
              <h2>Construisons une communaute forte</h2>
              <p>
                Chaque membre de Kesher Nitsri participe a une chaine de
                solidarite qui permet a Bnei Yeshivot de continuer a accompagner
                les jeunes, les Avrekhim et les familles francophones en Israel.
              </p>
              <div className="hero-actions">
                <Button asChild variant="accent" size="lg">
                  <Link href="/dons">Rejoindre Kesher Nitsri</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
