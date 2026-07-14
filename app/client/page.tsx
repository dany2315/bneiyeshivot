import Link from "next/link";
import { PageShell, StatusBadge } from "../components";
import {
  bahourDonations,
  bahourDocuments,
  bahourMivhanim,
  bahourRequests,
  bahourTimeline,
  clientItems,
} from "../data";
import { DocumentAttachmentCard } from "@/components/document-attachment-card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CalendarCheck,
  CheckCircle2,
  FileText,
  HeartHandshake,
  Trophy,
} from "lucide-react";

export const metadata = {
  title: "Espace Bahour",
};

export default function ClientPage() {
  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Suivi personnel</span>
            <h1>Espace Bahour</h1>
            <p>
              Un espace simple, integre au site, pour suivre ses demandes, ses
              inscriptions, ses dons, ses recus, ses commandes et ses notes de
              mivhan avec une connexion par code OTP.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <Tabs defaultValue="overview" className="bahour-tabs">
              <TabsList
                aria-label="Sections Espace Bahour"
                className="bahour-tabs-list"
              >
                <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
                <TabsTrigger value="requests">Demandes</TabsTrigger>
                <TabsTrigger value="events">Evenements</TabsTrigger>
                <TabsTrigger value="donations">Dons</TabsTrigger>
                <TabsTrigger value="store">Boutique</TabsTrigger>
                <TabsTrigger value="mivhanim">Mivhanim</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="grid gap-5">
                <Alert className="bahour-alert">
                  <CheckCircle2 />
                  <AlertTitle>Connexion Bahour par code OTP</AlertTitle>
                  <AlertDescription>
                    Le futur compte affichera uniquement les dossiers lies a
                    l&apos;email confirme, sans mot de passe a retenir.
                  </AlertDescription>
                </Alert>
              </TabsContent>
              <TabsContent value="requests" className="grid gap-5">
                <div className="grid grid-3">
                  {bahourRequests.map(([type, status, detail]) => (
                    <Card key={type}>
                      <CardHeader>
                        <FileText className="size-5 text-[var(--accent)]" />
                        <CardTitle>{type}</CardTitle>
                        <CardDescription>{detail}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <StatusBadge
                          tone={status.includes("manquants") ? "gold" : "blue"}
                        >
                          {status}
                        </StatusBadge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="donations" className="grid gap-5">
                <div className="grid grid-3">
                  {bahourDonations.map(([amount, receipt, provider]) => (
                    <Card key={`${amount}-${receipt}`}>
                      <CardHeader>
                        <HeartHandshake className="size-5 text-[var(--accent)]" />
                        <CardTitle>{amount}</CardTitle>
                        <CardDescription>{provider}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <StatusBadge
                          tone={
                            receipt.includes("disponible") ? "green" : "blue"
                          }
                        >
                          {receipt}
                        </StatusBadge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="events" className="grid gap-5">
                <Alert>
                  <CalendarCheck />
                  <AlertTitle>Participations aux evenements</AlertTitle>
                  <AlertDescription>
                    Les futures demandes de participation apparaitront ici avec
                    statut, date, lieu et messages de l&apos;equipe.
                  </AlertDescription>
                </Alert>
              </TabsContent>
              <TabsContent value="store" className="grid gap-5">
                <Alert>
                  <HeartHandshake />
                  <AlertTitle>Commandes boutique</AlertTitle>
                  <AlertDescription>
                    Les achats de packs seront relies au suivi Bahour avec
                    paiement, preparation et livraison.
                  </AlertDescription>
                </Alert>
              </TabsContent>
              <TabsContent value="mivhanim" className="grid gap-5">
                <div className="grid grid-3">
                  {bahourMivhanim.map(([month, status, grade]) => (
                    <Card key={month}>
                      <CardHeader>
                        <Trophy className="size-5 text-[var(--accent)]" />
                        <CardTitle>{month}</CardTitle>
                        <CardDescription>{grade}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <StatusBadge
                          tone={status === "Publie" ? "green" : "blue"}
                        >
                          {status}
                        </StatusBadge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="portal-summary">
              <Card className="portal-card">
                <CardHeader>
                  <span className="eyebrow">Tableau personnel</span>
                  <CardTitle className="text-3xl">
                    Tout ton suivi au meme endroit
                  </CardTitle>
                  <CardDescription>
                    Demandes, documents, dons, commandes et notes restent lies a
                    ton email. Tu reviens avec un code OTP, sans mot de passe.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/services">Nouvelle demande</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/dons">Voir mes dons</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <span className="icon-box">LIVE</span>
                  <CardTitle>Statut actuel</CardTitle>
                  <CardDescription>
                    2 actions a completer et 1 document attendu.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <StatusBadge tone="gold">Documents manquants</StatusBadge>
                  <StatusBadge tone="blue">Mivhan confirme</StatusBadge>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-3">
              <Card>
                <CardHeader>
                  <span className="icon-box">OTP</span>
                  <CardTitle>Connexion sans mot de passe</CardTitle>
                  <CardDescription>
                    Better Auth enverra un code par email. Un visiteur pourra
                    donner ou deposer une premiere demande sans compte explicite.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <span className="icon-box">DOC</span>
                  <CardTitle>Documents centralises</CardTitle>
                  <CardDescription>
                    Les pieces demandees seront ajoutees au bon dossier et
                    stockees sur AWS S3 via URLs signees.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <span className="icon-box">MSG</span>
                  <CardTitle>Messages de suivi</CardTitle>
                  <CardDescription>
                    Le Bahour verra les messages publics de l&apos;equipe,
                    separes des notes internes admin.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="section-header" style={{ marginTop: 36 }}>
              <h2>Modules personnels</h2>
              <p>
                Les blocs ci-dessous prefigurent les vraies donnees liees a ton
                compte : demandes, dons, inscriptions et mivhanim.
              </p>
            </div>
            <div className="grid grid-3">
              <Card>
                <CardHeader>
                  <FileText className="size-5 text-[var(--accent)]" />
                  <CardTitle>Demandes</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {bahourRequests.map(([type, status, detail]) => (
                    <div
                      className="rounded-xl border border-[var(--border)] p-3"
                      key={type}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <strong>{type}</strong>
                        <StatusBadge
                          tone={status.includes("manquants") ? "gold" : "blue"}
                        >
                          {status}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {detail}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Trophy className="size-5 text-[var(--accent)]" />
                  <CardTitle>Mivhanim</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {bahourMivhanim.map(([month, status, grade]) => (
                    <div
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3"
                      key={month}
                    >
                      <div>
                        <strong>{month}</strong>
                        <p className="text-sm text-[var(--muted)]">{grade}</p>
                      </div>
                      <StatusBadge tone={status === "Publie" ? "green" : "blue"}>
                        {status}
                      </StatusBadge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <HeartHandshake className="size-5 text-[var(--accent)]" />
                  <CardTitle>Dons et recus</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {bahourDonations.map(([amount, receipt, provider]) => (
                    <div
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3"
                      key={`${amount}-${receipt}`}
                    >
                      <div>
                        <strong>{amount}</strong>
                        <p className="text-sm text-[var(--muted)]">
                          {provider}
                        </p>
                      </div>
                      <StatusBadge
                        tone={receipt.includes("disponible") ? "green" : "blue"}
                      >
                        {receipt}
                      </StatusBadge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="section-header" style={{ marginTop: 36 }}>
              <h2>Pieces jointes</h2>
              <p>
                Les nouveaux attachments sont prevus dans le parcours : ajout,
                statut, relance et verification admin.
              </p>
            </div>
            <div className="grid grid-3">
              <DocumentAttachmentCard title="Passeport" status="missing" />
              <DocumentAttachmentCard title="Certificat de yeshiva" status="received" />
              <DocumentAttachmentCard title="Photo d'identite" status="missing" />
            </div>

            <div className="module-grid" style={{ marginTop: 36 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Documents du dossier</CardTitle>
                  <CardDescription>
                    Lecture rapide des pieces attendues et de leur statut.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {bahourDocuments.map(([name, status, detail]) => (
                    <div
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-3"
                      key={name}
                    >
                      <div>
                        <strong>{name}</strong>
                        <p className="text-sm text-[var(--muted)]">{detail}</p>
                      </div>
                      <StatusBadge
                        tone={status === "Recu" ? "green" : "gold"}
                      >
                        {status}
                      </StatusBadge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                  <CardDescription>
                    Historique visible par le Bahour.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {bahourTimeline.map(([date, title, detail]) => (
                    <div className="timeline-row" key={`${date}-${title}`}>
                      <span />
                      <div>
                        <strong>{title}</strong>
                        <p>{detail}</p>
                        <small>{date}</small>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="section-header" style={{ marginTop: 36 }}>
              <h2>Activite recente</h2>
              <p>
                Les donnees ci-dessous sont des exemples. Elles seront
                remplacees par les vrais dossiers lies a l&apos;utilisateur
                connecte.
              </p>
            </div>
            <div className="table-wrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Element</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientItems.map(([label, status, action], index) => (
                    <TableRow key={label}>
                      <TableCell>{label}</TableCell>
                      <TableCell>
                        <StatusBadge tone="blue">{status}</StatusBadge>
                      </TableCell>
                      <TableCell>{action}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                          <CalendarCheck className="size-4" />
                          {index === 0 ? "Aujourd'hui" : "Cette semaine"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
