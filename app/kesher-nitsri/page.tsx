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
    "Kesher Nitsri, la communauté engagée qui soutient les actions de Bnei Yeshivot.",
};

const actions = [
  {
    title: "Soutien aux familles lors des fêtes",
    description:
      "Organisation de distributions de colis alimentaires et de produits nécessaires pour les Yamim Tovim.",
    Icon: Gift,
  },
  {
    title: "Distribution de bons d’achat",
    description:
      "Une aide concrète pour permettre aux familles de répondre à leurs besoins selon leur situation.",
    Icon: ShoppingBasket,
  },
  {
    title: "Fournitures scolaires",
    description:
      "Des distributions de matériel scolaire pour accompagner les familles avant la rentrée.",
    Icon: School,
  },
  {
    title: "Actions de solidarité",
    description:
      "Un soutien aux familles francophones selon les besoins et les possibilités de l’association.",
    Icon: Heart,
  },
];

const benefits = [
  "Informations en avant-première sur les actions et projets",
  "Accès prioritaire lorsque le nombre de places est limité",
  "Priorité lors de certaines opérations de solidarité",
  "Invitations à des rencontres, conférences et événements réservés aux membres",
  "Lien privilégié avec l’équipe et les projets développés toute l’année",
];

export default function KesherNitsriPage() {
  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Kesher Nitsri</span>
            <h1>Une communauté engagée au service de la communauté francophone en Israël</h1>
            <p>
              Kesher Nitsri rassemble les personnes qui souhaitent soutenir
              durablement les actions de Bnei Yeshivot et participer à construire
              une communauté francophone plus forte, plus solidaire et plus
              engagée.
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
              <h2>Votre engagement permet de développer des actions concrètes</h2>
              <p>
                En rejoignant Kesher Nitsri, vous ne faites pas seulement un don :
                vous devenez partenaire de projets qui accompagnent les jeunes,
                les Avrekhim et les familles francophones en Israël.
              </p>
            </div>
            <Card className="program-highlight-card">
              <CardHeader>
                <span className="icon-box">
                  <Sparkles className="size-5" />
                </span>
                <CardTitle>À partir de 80 shekels par mois</CardTitle>
                <CardDescription>
                  Votre soutien régulier permet à Bnei Yeshivot de prévoir ses
                  actions sur le long terme, développer de nouveaux projets et
                  répondre davantage aux besoins de la communauté.
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
                Kesher Nitsri rend possibles des actions de solidarité menées
                tout au long de l’année.
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
                <CardTitle>Un lien privilégié avec les actions</CardTitle>
                <CardDescription>
                  Les membres intègrent une communauté engagée et suivent les
                  projets développés par Bnei Yeshivot au fil de l’année.
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
              <h2>Construisons une communauté forte</h2>
              <p>
                Chaque membre de Kesher Nitsri participe à une chaîne de
                solidarité qui permet à Bnei Yeshivot de continuer à accompagner
                les jeunes, les Avrekhim et les familles francophones en Israël.
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
