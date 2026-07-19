import Link from "next/link";
import { redirect } from "next/navigation";
import {
  EventRegistrationStatus,
  ServiceRequestStatus,
  ServiceRequestType,
} from "@prisma/client";
import { PageShell, StatusBadge } from "../components";
import { updateBahourServiceRequest } from "@/app/client/actions";
import { DonorDonationsTable } from "@/components/donor-donations-table";
import { requireBahourUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { countDonationsForEmail, hasBahourActivity } from "@/lib/donor-access";
import { formatDateTime } from "@/lib/event-content";
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
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarCheck,
  CheckCircle2,
  Download,
  FileText,
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

function formatReward(amountCents: number | null, currency: string) {
  if (amountCents === null) return "0";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

function readDate(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function payloadValue(payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) return "";
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function requestSubjectName(
  payload: unknown,
  fallbackUser: { email: string; firstName?: string | null; lastName?: string | null },
) {
  const firstName = payloadValue(payload, "firstName");
  const lastName = payloadValue(payload, "lastName");
  const payloadName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const fallbackName = [fallbackUser.firstName, fallbackUser.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return payloadName || fallbackName || fallbackUser.email;
}

const editableRequestFields = [
  ["firstName", "Prenom", "text"],
  ["lastName", "Nom", "text"],
  ["phone", "Telephone", "text"],
  ["parentPhone", "Telephone des parents", "text"],
  ["birthDate", "Date de naissance", "date"],
  ["nationality", "Nationalite", "text"],
  ["passportNumber", "Numero passeport", "text"],
  ["school", "Yeshiva / programme", "text"],
  ["personStatus", "Statut visa : bahour-yeshiva ou massa", "text"],
] as const;

function requestedFieldsFromPayload(payload: unknown, type: ServiceRequestType) {
  if (typeof payload !== "object" || payload === null) {
    return editableRequestFields.filter(
      ([field]) => type === ServiceRequestType.VISA_STUDENT || field !== "personStatus",
    );
  }

  const fields = (payload as Record<string, unknown>).__requestedFields;
  const requested = Array.isArray(fields)
    ? new Set(fields.filter((field): field is string => typeof field === "string"))
    : null;
  const available = editableRequestFields.filter(
    ([field]) => type === ServiceRequestType.VISA_STUDENT || field !== "personStatus",
  );

  if (!requested || requested.size === 0) {
    return available;
  }

  return available.filter(([field]) => requested.has(field));
}

function finalDocuments(
  documents: Array<{ id: string; label: string }>,
  type: ServiceRequestType,
) {
  return documents.filter((document) =>
    type === ServiceRequestType.VISA_STUDENT
      ? document.label.toLowerCase().includes("visa recu")
      : document.label.toLowerCase().includes("document final"),
  );
}

export default async function ClientPage({
  searchParams,
}: {
  searchParams: Promise<{ donFrom?: string; donTo?: string }>;
}) {
  const user = await requireBahourUser();
  const params = await searchParams;
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
        documents: { orderBy: { createdAt: "asc" } },
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
      include: {
        payments: { orderBy: { createdAt: "desc" } },
        receipt: true,
      },
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
  const from = readDate(params.donFrom);
  const to = readDate(params.donTo);
  const donationDate =
    from || to
      ? {
          gte: from ?? undefined,
          lt: to ? new Date(to.getTime() + 24 * 60 * 60 * 1000) : undefined,
        }
      : undefined;
  const filteredDonations = donationDate
    ? donations.filter((donation) => {
        const date = donation.paidAt ?? donation.createdAt;
        return (
          (!donationDate.gte || date >= donationDate.gte) &&
          (!donationDate.lt || date < donationDate.lt)
        );
      })
    : donations;

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

            <Tabs
              defaultValue={params.donFrom || params.donTo ? "dons" : "requests"}
              className="bahour-tabs mt-8"
            >
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
                  <div className="grid gap-4">
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
                          <div className="rounded-xl border border-[var(--border)] bg-[var(--subtle)] px-3 py-2 text-sm text-[var(--primary)]">
                            <span className="font-bold">Demande pour : </span>
                            {requestSubjectName(request.payload, user)}
                          </div>
                          {finalDocuments(request.documents, request.type).map(
                            (document) => (
                              <Button asChild key={document.id} variant="secondary">
                                <a href={`/api/requests/documents/${document.id}/download`}>
                                  <Download className="size-4" />
                                  Telecharger {document.label.toLowerCase()}
                                </a>
                              </Button>
                            ),
                          )}
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
                          {request.status === ServiceRequestStatus.MISSING_DOCUMENTS ? (
                            <form
                              action={updateBahourServiceRequest}
                              className="mt-2 grid gap-3 rounded-xl border border-[var(--border)] bg-white p-3"
                            >
                              <input
                                name="requestId"
                                type="hidden"
                                value={request.id}
                              />
                              <div className="rounded-lg bg-[var(--subtle)] p-3 text-sm text-[var(--primary)]">
                                A modifier :{" "}
                                {requestedFieldsFromPayload(
                                  request.payload,
                                  request.type,
                                )
                                  .map(([, label]) => label)
                                  .join(", ")}
                              </div>
                              <div className="grid gap-3 md:grid-cols-2">
                                {requestedFieldsFromPayload(
                                  request.payload,
                                  request.type,
                                ).map(([field, label, inputType]) => (
                                  <Input
                                    defaultValue={payloadValue(request.payload, field)}
                                    key={field}
                                    name={field}
                                    placeholder={label}
                                    type={inputType}
                                  />
                                ))}
                              </div>
                              <Textarea
                                disabled
                                value={
                                  request.publicNote ||
                                  "Modifiez uniquement les informations demandees par l'equipe."
                                }
                              />
                              <Button type="submit">
                                Envoyer mes modifications
                              </Button>
                            </form>
                          ) : null}
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
                  <DonorDonationsTable
                    actionPath="/client"
                    donations={filteredDonations}
                    from={params.donFrom}
                    title="Mes dons"
                    to={params.donTo}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
