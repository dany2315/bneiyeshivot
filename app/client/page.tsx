import Link from "next/link";
import { redirect } from "next/navigation";
import {
  EventRegistrationStatus,
  ServiceRequestStatus,
  ServiceRequestType,
} from "@prisma/client";
import { PageShell, StatusBadge } from "../components";
import { requireBahourUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { countDonationsForEmail, hasBahourActivity } from "@/lib/donor-access";
import { formatDateTime } from "@/lib/event-content";
import { fileUrl } from "@/lib/files";
import {
  formatDonationFrequency,
  formatMoney,
  paymentStatusLabels,
} from "@/lib/donations";
import { isMivhanRegistrationOpen } from "@/lib/talmoudo-beyado";
import { BahourMivhanRegistrationCard } from "@/components/bahour-mivhan-registration-card";
import { BahourMivhanSignupCards } from "@/components/bahour-mivhan-signup-cards";
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
import {
  CalendarCheck,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Gift,
  Trophy,
} from "lucide-react";

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

function metadataObject(metadata: unknown) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {};
}

function metadataText(metadata: unknown, key: string) {
  const value = metadataObject(metadata)[key];

  return typeof value === "string" ? value : null;
}

function formatReward(amountCents: number | null, currency: string) {
  if (amountCents === null) return "0";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

export default async function ClientPage() {
  const user = await requireBahourUser();
  const [isBahour, donationCount] = await Promise.all([
    hasBahourActivity(user),
    countDonationsForEmail(user.email, user.id),
  ]);

  if (!isBahour && donationCount > 0) {
    redirect("/donateur");
  }

  const [
    requests,
    registrations,
    mivhanRegistrations,
    mivhanSessions,
    donations,
  ] =
    await Promise.all([
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
    prisma.mivhanRegistration.findMany({
      where: { userId: user.id },
      include: { session: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mivhanSession.findMany({
      where: {
        date: { gte: new Date() },
      },
      orderBy: { date: "asc" },
    }),
    prisma.donation.findMany({
      where: {
        OR: [
          { donorEmail: user.email },
          { userId: user.id },
          {
            metadata: {
              path: ["receiptEmail"],
              equals: user.email,
            },
          },
        ],
      },
      include: { receipt: true },
      orderBy: { paidAt: "desc" },
    }),
  ]);

  const inReviewCount = requests.filter(
    (item) => item.status === "IN_REVIEW",
  ).length;
  const missingDocsCount = requests.filter(
    (item) => item.status === "MISSING_DOCUMENTS",
  ).length;
  const gradedMivhanim = mivhanRegistrations.filter(
    (item) => item.grade !== null,
  );
  const averageGrade =
    gradedMivhanim.length > 0
      ? Math.round(
          gradedMivhanim.reduce((total, item) => total + (item.grade ?? 0), 0) /
            gradedMivhanim.length,
        )
      : null;
  const totalRewardCents = mivhanRegistrations.reduce(
    (total, item) =>
      item.rewardCurrency === "ILS"
        ? total + (item.rewardAmountCents ?? 0)
        : total,
    0,
  );
  const registeredFutureSessionIds = new Set(
    mivhanRegistrations
      .filter((registration) => registration.session.date >= new Date())
      .map((registration) => registration.sessionId),
  );
  const talmoudoSessionOptions = mivhanSessions
    .filter((session) => !registeredFutureSessionIds.has(session.id))
    .map((session) => ({
      disabled: !isMivhanRegistrationOpen(session),
      id: session.id,
      title: session.title,
      dateLabel: formatDateTime(session.date),
      location: session.location,
    }));

  return (
    <PageShell>
      <main>
        <section className="section">
          <div className="container">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Espace Bahour</span>
                <h1 className="text-3xl font-bold text-[var(--primary)]">
                  Bonjour {user.firstName || "Bahour"}
                </h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/services">Nouvelle demande</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/evenements">Voir les evenements</Link>
                </Button>
              </div>
            </div>

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
                {mivhanRegistrations.length > 0 && (
                  <StatusBadge tone="blue">
                    {mivhanRegistrations.length} mivhanim
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
                <TabsTrigger value="mivhanim">Mivhanim</TabsTrigger>
                {donations.length > 0 && (
                  <TabsTrigger value="dons">Dons</TabsTrigger>
                )}
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

              <TabsContent value="mivhanim" className="grid gap-5">
                <div className="grid grid-3">
                  <Card>
                    <CardHeader>
                      <Trophy className="size-5 text-[var(--accent)]" />
                      <CardTitle>{mivhanRegistrations.length}</CardTitle>
                      <CardDescription>Mivhanim Talmoudo Beyado</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Trophy className="size-5 text-[var(--accent)]" />
                      <CardTitle>
                        {averageGrade === null ? "-" : `${averageGrade} / 100`}
                      </CardTitle>
                      <CardDescription>Moyenne des notes</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Trophy className="size-5 text-[var(--accent)]" />
                      <CardTitle>{formatReward(totalRewardCents, "ILS")}</CardTitle>
                      <CardDescription>Recompenses recues</CardDescription>
                    </CardHeader>
                  </Card>
                </div>

                <BahourMivhanSignupCards
                  initialUser={user}
                  sessions={talmoudoSessionOptions}
                />

                {mivhanRegistrations.length === 0 ? (
                  <Alert>
                    <Trophy />
                    <AlertTitle>Aucun mivhan pour le moment</AlertTitle>
                    <AlertDescription>
                      Vos inscriptions, notes et recompenses Talmoudo Beyado
                      apparaitront ici.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-3">
                    {mivhanRegistrations.map((registration) => (
                      <BahourMivhanRegistrationCard
                        canEdit={isMivhanRegistrationOpen(registration.session)}
                        dateLabel={formatDateTime(registration.session.date)}
                        key={registration.id}
                        registration={registration}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {donations.length > 0 && (
                <TabsContent value="dons" className="grid gap-5">
                  <div className="grid grid-3">
                    {donations.map((donation) => {
                      const stripeReceiptUrl = metadataText(
                        donation.metadata,
                        "stripeReceiptUrl",
                      );
                      const cerfaUrl = fileUrl(donation.receipt?.fileKey);

                      return (
                        <Card key={donation.id}>
                          <CardHeader>
                            <Gift className="size-5 text-[var(--accent)]" />
                            <CardTitle>
                              {formatMoney(
                                donation.amountCents,
                                donation.currency,
                              )}
                            </CardTitle>
                            <CardDescription>
                              {formatDonationFrequency(
                                donation.frequency,
                                donation.recurringMonths,
                              )}{" "}
                              - {paymentStatusLabels[donation.status]}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex flex-wrap gap-2">
                            {stripeReceiptUrl ? (
                              <Button asChild variant="secondary">
                                <a
                                  href={stripeReceiptUrl}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  <ExternalLink className="size-4" />
                                  Recu paiement
                                </a>
                              </Button>
                            ) : null}
                            {cerfaUrl ? (
                              <Button asChild variant="secondary">
                                <a
                                  href={cerfaUrl}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  <Download className="size-4" />
                                  Recu Cerfa
                                </a>
                              </Button>
                            ) : null}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
