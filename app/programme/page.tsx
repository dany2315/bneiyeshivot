import Link from "next/link";
import { PageShell, StatusBadge } from "../components";
import { bahourMivhanim, events } from "../data";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarCheck, ClipboardCheck, Trophy } from "lucide-react";

export const metadata = {
  title: "Programme",
};

export default function ProgrammePage() {
  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Talmoudo Beyado</span>
            <h1>Programme</h1>
            <p>
              Une page dediee au programme mensuel : inscription au mivhan,
              presence physique, saisie des notes par l&apos;admin et suivi dans
              l&apos;Espace Bahour.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container split">
            <div>
              <span className="eyebrow">Mivhan mensuel</span>
              <h2>Inscription, participation et notes</h2>
              <p>
                Le Bahour pourra s&apos;inscrire chaque mois. L&apos;admin pourra
                confirmer les participants, marquer la presence et renseigner la
                note du mivhan.
              </p>
              <div className="hero-actions">
                <Button asChild>
                  <Link href="/client">Voir mon suivi</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/contact">Poser une question</Link>
                </Button>
              </div>
            </div>
            <Card>
              <CardHeader>
                <span className="icon-box">
                  <Trophy className="size-4" />
                </span>
                <CardTitle>Prochaine session</CardTitle>
                <CardDescription>
                  Inscription mensuelle, confirmation par l&apos;equipe et suivi
                  de la note une fois publiee.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <StatusBadge tone="blue">Inscription ouverte</StatusBadge>
                <Button>S&apos;inscrire au prochain mivhan</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="section-header">
              <h2>Fonctionnement</h2>
              <p>
                La page programme sert de vitrine publique. Les inscriptions et
                notes seront ensuite gerees dans l&apos;admin.
              </p>
            </div>
            <div className="grid grid-3">
              <Card>
                <CardHeader>
                  <CalendarCheck className="size-5 text-[var(--accent)]" />
                  <CardTitle>Inscription mensuelle</CardTitle>
                  <CardDescription>
                    Le Bahour s&apos;inscrit pour la session du mois depuis le
                    site.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <ClipboardCheck className="size-5 text-[var(--accent)]" />
                  <CardTitle>Gestion admin</CardTitle>
                  <CardDescription>
                    L&apos;equipe valide les inscrits, suit la presence et ajoute
                    les notes.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Trophy className="size-5 text-[var(--accent)]" />
                  <CardTitle>Suivi Bahour</CardTitle>
                  <CardDescription>
                    Les notes publiees apparaissent dans l&apos;Espace Bahour.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Apercu des notes</h2>
              <p>
                Exemple de rendu dans le suivi personnel. Les donnees seront
                remplacees par les vraies inscriptions.
              </p>
            </div>
            <div className="table-wrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mois</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bahourMivhanim.map(([month, status, grade]) => (
                    <TableRow key={month}>
                      <TableCell>{month}</TableCell>
                      <TableCell>
                        <StatusBadge tone={status === "Publie" ? "green" : "blue"}>
                          {status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>{grade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="section-header">
              <h2>Evenements lies</h2>
              <p>
                Les evenements de Torah et sessions speciales peuvent etre lies
                au programme.
              </p>
            </div>
            <div className="grid grid-3">
              {events.slice(0, 3).map((event) => (
                <Card key={event.title}>
                  <CardHeader>
                    <Badge variant="info">{event.date}</Badge>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
