import { StatusBadge } from "../components";
import {
  adminMetrics,
  adminPipelines,
  adminQueue,
  donationRows,
  requestRows,
} from "../data";
import { AdminShell } from "@/components/admin-sidebar";
import { DocumentAttachmentCard } from "@/components/document-attachment-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Eye,
  Filter,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";

export const metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <AdminShell>
        <div className="admin-header">
          <div>
            <span className="eyebrow">Back-office Bnei Yeshivot</span>
            <h1>Dashboard admin</h1>
          </div>
          <div className="admin-table-actions">
            <Button variant="secondary">
              <Download />
              Export
            </Button>
            <Button>
              <Plus />
              Nouvelle action
            </Button>
          </div>
        </div>

        <div className="grid grid-4">
          {adminMetrics.map(([label, value, detail]) => (
            <Card className="metric-card" key={label}>
              <CardHeader>
                <CardDescription>{label}</CardDescription>
                <CardTitle>{value}</CardTitle>
                <CardDescription>{detail}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <section className="section admin-section-tight">
          <div className="section-header">
            <h2>Pipeline dossiers</h2>
            <p>
              Vue courte pour savoir ou se trouvent les demandes avant de
              brancher les vraies listes Prisma.
            </p>
          </div>
          <div className="grid grid-4">
            {adminPipelines.map(([label, value, detail], index) => (
              <Card key={label}>
                <CardHeader>
                  <CardDescription>{label}</CardDescription>
                  <CardTitle>{value}</CardTitle>
                  <CardDescription>{detail}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={[38, 68, 52, 86][index]} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-header">
            <h2>Demandes a traiter</h2>
            <p>
              Base pour les futures tables shadcn : filtres par statut,
              recherche, export CSV, assignation et actions groupées.
            </p>
          </div>
          <div className="admin-toolbar">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
              <Input
                className="pl-9"
                placeholder="Rechercher un bahour, dossier, email..."
              />
            </div>
            <Button variant="secondary">
              <Filter />
              Statut
            </Button>
            <Button variant="secondary">Responsable</Button>
          </div>
          <div className="table-wrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bahour</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priorite</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestRows.map(([name, type, status, date], index) => (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{type}</TableCell>
                    <TableCell>
                      <StatusBadge tone={index === 3 ? "green" : "gold"}>
                        {status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{date}</TableCell>
                    <TableCell>
                      <StatusBadge tone={index < 2 ? "blue" : "green"}>
                        {index < 2 ? "A relancer" : "Normal"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Actions"
                            />
                          }
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions dossier</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye />
                            Ouvrir le dossier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail />
                            Relancer le Bahour
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Changer le statut</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-header">
            <h2>Dons et recus</h2>
            <p>
              Base de gestion pour Stripe, Nedarim Plus, recus CERFA et exports
              comptables.
            </p>
          </div>
          <div className="table-wrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donateur</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Moyen</TableHead>
                  <TableHead>Recu</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donationRows.map(([name, amount, provider, receipt]) => (
                  <TableRow key={`${name}-${amount}`}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{amount}</TableCell>
                    <TableCell>{provider}</TableCell>
                    <TableCell>
                      <StatusBadge
                        tone={
                          receipt.includes("demande") ? "gold" : "green"
                        }
                      >
                        {receipt}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="secondary">
                        Generer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-header">
            <h2>File operationnelle</h2>
            <p>
              Vue rapide pour prioriser les actions du jour : dossiers,
              paiements, recus et mivhanim.
            </p>
          </div>
          <div className="module-grid">
            <Card>
              <CardHeader>
                <CardTitle>Priorites</CardTitle>
                <CardDescription>
                  Actions concretes a faire par l&apos;equipe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="table-wrap">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Module</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Priorite</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminQueue.map(([module, name, action, priority]) => (
                        <TableRow key={`${module}-${name}`}>
                          <TableCell>{module}</TableCell>
                          <TableCell>{name}</TableCell>
                          <TableCell>{action}</TableCell>
                          <TableCell>
                            <StatusBadge
                              tone={priority === "Haute" ? "gold" : "green"}
                            >
                              {priority}
                            </StatusBadge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            <Card className="portal-card">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Raccourcis admin a brancher aux vraies mutations ensuite.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button variant="secondary">Creer un evenement</Button>
                <Button variant="secondary">Saisir une note mivhan</Button>
                <Button variant="secondary">Generer un recu</Button>
                <Button variant="secondary">Relancer documents</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-header">
            <h2>Pieces jointes a verifier</h2>
            <p>
              Meme logique pour les nouveaux attachments : upload, statut,
              relance et rattachement au dossier.
            </p>
          </div>
          <div className="grid grid-3">
            <DocumentAttachmentCard title="Passeport David Cohen" status="missing" />
            <DocumentAttachmentCard title="Certificat yeshiva" status="received" />
            <DocumentAttachmentCard title="Formulaire koupat holim" status="missing" />
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-header">
            <h2>Modules Phase 1</h2>
            <p>
              Ces blocs seront branches aux vraies donnees apres validation des
              formulaires visa et koupat holim.
            </p>
          </div>
          <div className="grid grid-3">
            <Card className="portal-card">
              <CardHeader>
                <span className="icon-box">REQ</span>
                <CardTitle>Demandes</CardTitle>
                <CardDescription>
                  Timeline, documents, messages Bahour, notes internes et
                  statuts.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="portal-card">
              <CardHeader>
                <span className="icon-box">PAY</span>
                <CardTitle>Dons Stripe</CardTitle>
                <CardDescription>
                  Paiements, donateurs, recus, export et rapprochement webhooks.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="portal-card">
              <CardHeader>
                <span className="icon-box">EVT</span>
                <CardTitle>Evenements</CardTitle>
                <CardDescription>
                  Creation avec contenu riche, image, date, capacite et
                  inscrits.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
    </AdminShell>
  );
}
