import Link from "next/link";
import {
  EventRegistrationStatus,
  ServiceRequestStatus,
  ServiceRequestType,
} from "@prisma/client";
import { PageShell, StatusBadge } from "../components";
import { requireBahourUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/event-content";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CalendarCheck, CheckCircle2, FileText, Trophy } from "lucide-react";

export const metadata = {
  title: "Espace Bahour",
};

const requestStatusLabels: Record<ServiceRequestStatus, string> = {
  SUBMITTED: "Deposee",
  IN_REVIEW: "En traitement",
  MISSING_DOCUMENTS: "Documents manquants",
  APPROVED: "Approuvee",
  REJECTED: "Refusee",
  COMPLETED: "Terminee",
};

const requestTypeLabels: Record<ServiceRequestType, string> = {
  VISA_STUDENT: "Visa etudiant",
  KOUPAT_HOLIM: "Koupat Holim",
  GENERAL_CONTACT: "Contact",
};

const registrationLabels: Record<EventRegistrationStatus, string> = {
  SUBMITTED: "Demande recue",
  CONFIRMED: "Confirmee",
  WAITLISTED: "Liste d'attente",
  CANCELED: "Annulee",
};

function requestTone(status: ServiceRequestStatus) {
  if (status === "APPROVED" || status === "COMPLETED") return "green";
  if (status === "MISSING_DOCUMENTS" || status === "REJECTED") return "gold";
  return "blue";
}

function registrationTone(status: EventRegistrationStatus) {
  if (status === "CONFIRMED") return "green";
  if (status === "WAITLISTED" || status === "CANCELED") return "gold";
  return "blue";
}

export default async function ClientPage() {
  const user = await requireBahourUser();
  const [requests, registrations] = await Promise.all([
    prisma.serviceRequest.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.eventRegistration.findMany({
      where: { userId: user.id },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const inReviewCount = requests.filter(
    (item) => item.status === "IN_REVIEW",
  ).length;
  const missingDocsCount = requests.filter(
    (item) => item.status === "MISSING_DOCUMENTS",
  ).length;

  return (
    <PageShell>
      <main>
        <section className="section">
          <div className="container">
            <Card className="portal-card">
              <CardHeader>
                <span className="eyebrow">Espace Bahour</span>
                <CardTitle className="text-3xl">
                  Bonjour {user.firstName || "Bahour"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/services">Nouvelle demande</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/evenements">Voir les evenements</Link>
                </Button>
              </CardContent>
            </Card>

            {(requests.length > 0 || registrations.length > 0) && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
                <span>Statut :</span>
                {inReviewCount > 0 && (
                  <StatusBadge tone="blue">
                    {inReviewCount} en traitement
                  </StatusBadge>
                )}
                {missingDocsCount > 0 && (
                  <StatusBadge tone="gold">
                    {missingDocsCount} document(s) manquant(s)
                  </StatusBadge>
                )}
                {registrations.length > 0 && (
                  <StatusBadge tone="green">
                    {registrations.length} inscription(s)
                  </StatusBadge>
                )}
                {inReviewCount === 0 &&
                  missingDocsCount === 0 &&
                  registrations.length === 0 && (
                    <StatusBadge tone="blue">
                      {requests.length} demande(s)
                    </StatusBadge>
                  )}
              </div>
            )}

            <Tabs defaultValue="requests" className="bahour-tabs mt-8">
              <TabsList
                aria-label="Sections Espace Bahour"
                className="bahour-tabs-list"
              >
                <TabsTrigger value="requests">Demandes</TabsTrigger>
                <TabsTrigger value="events">Evenements</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="mivhanim">Mivhanim</TabsTrigger>
              </TabsList>

              <TabsContent value="requests" className="grid gap-5">
                {requests.length === 0 ? (
                  <Alert>
                    <CheckCircle2 />
                    <AlertTitle>Aucune demande active</AlertTitle>
                    <AlertDescription>
                      Deposez une demande visa ou koupat holim depuis la page
                      services.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-3">
                    {requests.map((request) => (
                      <Card key={request.id}>
                        <CardHeader>
                          <FileText className="size-5 text-[var(--accent)]" />
                          <CardTitle>{requestTypeLabels[request.type]}</CardTitle>
                          <CardDescription>
                            Creee le{" "}
                            {request.createdAt.toLocaleDateString("fr-FR")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                          <StatusBadge tone={requestTone(request.status)}>
                            {requestStatusLabels[request.status]}
                          </StatusBadge>
                          {request.publicNote && (
                            <p className="rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-3 text-base text-[var(--primary)]">
                              {request.publicNote}
                            </p>
                          )}
                          {request.messages.map((message) => (
                            <p
                              className="text-sm leading-6 text-[var(--muted)]"
                              key={message.id}
                            >
                              {message.body}
                            </p>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="events" className="grid gap-5">
                {registrations.length === 0 ? (
                  <Alert>
                    <CalendarCheck />
                    <AlertTitle>Aucune inscription evenement</AlertTitle>
                    <AlertDescription>
                      Les inscriptions aux evenements apparaitront ici.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-3">
                    {registrations.map((registration) => (
                      <Card key={registration.id}>
                        <CardHeader>
                          <CalendarCheck className="size-5 text-[var(--accent)]" />
                          <CardTitle>{registration.event.title}</CardTitle>
                          <CardDescription>
                            {formatDateTime(registration.event.startsAt)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                          <StatusBadge tone={registrationTone(registration.status)}>
                            {registrationLabels[registration.status]}
                          </StatusBadge>
                          <Button asChild variant="secondary">
                            <Link href={`/evenements/${registration.event.slug}`}>
                              Voir l&apos;evenement
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="grid gap-5">
                <Alert>
                  <FileText />
                  <AlertTitle>Documents</AlertTitle>
                  <AlertDescription>
                    Le stockage et la validation piece par piece seront branches
                    avec S3 dans l&apos;etape upload.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="mivhanim" className="grid gap-5">
                <Alert>
                  <Trophy />
                  <AlertTitle>Mivhanim</AlertTitle>
                  <AlertDescription>
                    Les notes de mivhan seront rattachees a ce meme espace.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
