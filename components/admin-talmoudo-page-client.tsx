"use client";

import { useMemo, useState } from "react";
import { StatusBadge } from "@/app/components";
import {
  createAdminTalmoudoRegistrationState,
  createMivhanSessionState,
  updateAdminTalmoudoRegistrationState,
  updateMivhanRegistrationResultState,
  updateMivhanSessionSettingsState,
} from "@/app/admin/talmoudo-beyado/actions";
import {
  TalmoudoDialogActionForm,
  TalmoudoInlineActionForm,
} from "@/components/talmoudo-action-form";
import { TalmoudoLimoudFields } from "@/components/talmoudo-limoud-fields";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarPlus,
  ClipboardCheck,
  Edit3,
  Plus,
  Search,
} from "lucide-react";
import { dapimRangesToHebrew } from "@/lib/shas";

type AdminRegistration = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  yeshiva: string | null;
  massehet: string | null;
  dapim: string | null;
  dafStart: string | null;
  dafEnd: string | null;
  grade: number | null;
  note: string | null;
  rewardAmountCents: number | null;
  rewardCurrency: string;
  rewardPaid: boolean;
  resultEmailSentAt: Date | null;
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    name: string;
    phone: string | null;
    parentPhone: string | null;
    yeshiva: string | null;
  } | null;
};

type AdminSession = {
  id: string;
  title: string;
  date: Date;
  location: string | null;
  registrationCloseDaysBefore: number;
  registrationsClosed: boolean;
  registrations: AdminRegistration[];
};

function dateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getCloseDate(session: AdminSession) {
  const closeDate = new Date(session.date);
  closeDate.setDate(closeDate.getDate() - session.registrationCloseDaysBefore);
  return closeDate;
}

function isOpen(session: AdminSession) {
  return !session.registrationsClosed && new Date() < getCloseDate(session);
}

function formatReward(amountCents: number | null, currency: string) {
  if (amountCents === null) return "Non renseigne";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

function registrationName(registration: AdminRegistration) {
  return (
    [registration.firstName, registration.lastName].filter(Boolean).join(" ") ||
    [registration.user?.firstName, registration.user?.lastName]
      .filter(Boolean)
      .join(" ") ||
    registration.user?.name ||
    "Sans nom"
  );
}

function registrationSearchText(registration: AdminRegistration) {
  return [
    registrationName(registration),
    registration.email,
    registration.user?.email,
    registration.phone,
    registration.yeshiva,
    registration.user?.yeshiva,
    registration.massehet,
    registration.dapim,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function MivhanSettingsForm({ session }: { session: AdminSession }) {
  return (
    <TalmoudoInlineActionForm
      action={updateMivhanSessionSettingsState}
      submitLabel="Enregistrer les reglages"
    >
      <input name="sessionId" type="hidden" value={session.id} />
      <div className="form-grid">
        <div className="grid gap-2">
          <Label htmlFor={`title-${session.id}`}>Titre</Label>
          <Input defaultValue={session.title} id={`title-${session.id}`} name="title" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`date-${session.id}`}>Date</Label>
          <Input
            defaultValue={dateTimeLocalValue(session.date)}
            id={`date-${session.id}`}
            name="date"
            required
            type="datetime-local"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`location-${session.id}`}>Lieu</Label>
          <Input defaultValue={session.location ?? ""} id={`location-${session.id}`} name="location" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`close-${session.id}`}>Fermeture X jours avant</Label>
          <Input
            defaultValue={session.registrationCloseDaysBefore}
            id={`close-${session.id}`}
            max={30}
            min={0}
            name="registrationCloseDaysBefore"
            required
            type="number"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
        <input
          defaultChecked={session.registrationsClosed}
          name="registrationsClosed"
          type="checkbox"
        />
        Fermer les inscriptions manuellement
      </label>
      <p className="text-sm text-[var(--muted)]">
        Fermeture automatique prevue le {formatDate(getCloseDate(session))}.
      </p>
    </TalmoudoInlineActionForm>
  );
}

function RegistrationIdentityFields({
  registration,
}: {
  registration?: AdminRegistration;
}) {
  return (
    <>
      <Input
        defaultValue={registration?.firstName ?? registration?.user?.firstName ?? ""}
        name="firstName"
        placeholder="Prenom"
        required
      />
      <Input
        defaultValue={registration?.lastName ?? registration?.user?.lastName ?? ""}
        name="lastName"
        placeholder="Nom"
        required
      />
      <Input
        defaultValue={registration?.email ?? registration?.user?.email ?? ""}
        name="email"
        placeholder="Email"
        required
        type="email"
      />
      <Input
        defaultValue={registration?.phone ?? registration?.user?.phone ?? ""}
        name="phone"
        placeholder="Telephone"
        required
      />
      <Input
        defaultValue={registration?.user?.parentPhone ?? ""}
        name="parentPhone"
        placeholder="Telephone parents"
      />
      <Input
        defaultValue={registration?.yeshiva ?? registration?.user?.yeshiva ?? ""}
        name="yeshiva"
        placeholder="Yeshiva"
        required
      />
    </>
  );
}

function AddRegistrationDialog({ sessionId }: { sessionId: string }) {
  return (
    <TalmoudoDialogActionForm
      action={createAdminTalmoudoRegistrationState}
      className="sm:max-w-3xl"
      description="Vous pouvez inscrire un utilisateur existant ou creer son compte a partir de son email."
      submitLabel="Inscrire"
      title="Inscription admin"
      trigger={
        <Button className="w-fit" variant="secondary">
          <Plus />
          Inscrire un Bahour
        </Button>
      }
    >
      <input name="sessionId" type="hidden" value={sessionId} />
      <div className="form-grid">
        <RegistrationIdentityFields />
        <TalmoudoLimoudFields />
      </div>
    </TalmoudoDialogActionForm>
  );
}

function EditRegistrationDialog({
  registration,
}: {
  registration: AdminRegistration;
}) {
  return (
    <TalmoudoDialogActionForm
      action={updateAdminTalmoudoRegistrationState}
      className="sm:max-w-3xl"
      description="Modifiez les informations de l'inscription de ce mivhan."
      submitLabel="Enregistrer"
      title="Modifier l'inscription"
      trigger={
        <Button size="sm" variant="secondary">
          <Edit3 />
          Modifier
        </Button>
      }
    >
      <input name="registrationId" type="hidden" value={registration.id} />
      <div className="form-grid">
        <RegistrationIdentityFields registration={registration} />
        <TalmoudoLimoudFields
          defaultDapim={registration.dapim}
          defaultMasechet={registration.massehet}
        />
      </div>
    </TalmoudoDialogActionForm>
  );
}

function ResultDialog({ registration }: { registration: AdminRegistration }) {
  return (
    <TalmoudoDialogActionForm
      action={updateMivhanRegistrationResultState}
      className="sm:max-w-xl"
      description="La note et la recompense sont renseignees ensemble. Un email est envoye au Bahour."
      submitLabel="Enregistrer et envoyer l'email"
      title="Note et recompense"
      trigger={
        <Button size="sm" variant="secondary">
          <ClipboardCheck />
          Resultat
        </Button>
      }
    >
      <input name="registrationId" type="hidden" value={registration.id} />
      <div className="form-grid">
        <div className="grid gap-2">
          <Label>Note / 100</Label>
          <Input
            defaultValue={registration.grade ?? ""}
            max={100}
            min={0}
            name="grade"
            required
            step="0.5"
            type="number"
          />
        </div>
        <div className="grid gap-2">
          <Label>Montant recompense</Label>
          <Input
            defaultValue={
              registration.rewardAmountCents === null
                ? ""
                : registration.rewardAmountCents / 100
            }
            min={0}
            name="rewardAmount"
            step="0.01"
            type="number"
          />
        </div>
        <div className="grid gap-2">
          <Label>Devise</Label>
          <NativeSelect
            className="w-full"
            defaultValue={registration.rewardCurrency}
            name="rewardCurrency"
          >
            <NativeSelectOption value="ILS">ILS</NativeSelectOption>
            <NativeSelectOption value="EUR">EUR</NativeSelectOption>
            <NativeSelectOption value="USD">USD</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
        <input
          defaultChecked={registration.rewardPaid}
          name="rewardPaid"
          type="checkbox"
        />
        Recompense deja donnee
      </label>
      <Input
        defaultValue={registration.note ?? ""}
        name="note"
        placeholder="Note interne ou commentaire"
      />
    </TalmoudoDialogActionForm>
  );
}

export function AdminTalmoudoPageClient({
  gradedCount,
  sessions,
  totalRegistrations,
}: {
  gradedCount: number;
  sessions: AdminSession[];
  totalRegistrations: number;
}) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    sessions[0]?.id ?? null,
  );
  const [query, setQuery] = useState("");
  const selectedSession = sessions.find((session) => session.id === selectedSessionId);
  const filteredRegistrations = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!selectedSession) return [];
    if (!normalized) return selectedSession.registrations;

    return selectedSession.registrations.filter((registration) =>
      registrationSearchText(registration).includes(normalized),
    );
  }, [query, selectedSession]);

  return (
    <>
      <div className="admin-header">
        <div>
          <span className="eyebrow">Programme</span>
          <h1>Talmoudo Beyado</h1>
        </div>
        <TalmoudoDialogActionForm
          action={createMivhanSessionState}
          className="sm:max-w-2xl"
          description="Fixez la date mensuelle, le lieu et le delai de fermeture des inscriptions."
          submitLabel="Creer"
          title="Creer un mivhan"
          trigger={
            <Button>
              <CalendarPlus />
              Nouveau mivhan
            </Button>
          }
        >
          <div className="form-grid">
            <div className="grid gap-2">
              <Label htmlFor="new-title">Titre</Label>
              <Input
                id="new-title"
                name="title"
                placeholder="Mivhan Talmoudo Beyado - Av"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-date">Date du mivhan</Label>
              <Input id="new-date" name="date" required type="datetime-local" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-location">Lieu</Label>
              <Input id="new-location" name="location" placeholder="Jerusalem" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-close-days">Fermeture X jours avant</Label>
              <Input
                defaultValue={2}
                id="new-close-days"
                max={30}
                min={0}
                name="registrationCloseDaysBefore"
                required
                type="number"
              />
            </div>
          </div>
        </TalmoudoDialogActionForm>
      </div>

      <section className="section admin-section-tight">
        <div className="grid grid-3">
          <Card>
            <CardHeader>
              <CardTitle>{sessions.length}</CardTitle>
              <CardDescription>Mivhanim crees</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{totalRegistrations}</CardTitle>
              <CardDescription>Inscriptions Talmoudo Beyado</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{gradedCount}</CardTitle>
              <CardDescription>Resultats renseignes</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {sessions.length === 0 ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Aucun mivhan</CardTitle>
              <CardDescription>
                Creez le premier mivhan mensuel pour ouvrir les inscriptions.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="mt-6 grid gap-6">
            <div className="grid grid-3">
              {sessions.map((session) => {
                const open = isOpen(session);

                return (
                  <button
                    className="text-left"
                    key={session.id}
                    onClick={() => {
                      setSelectedSessionId(session.id);
                      setQuery("");
                    }}
                    type="button"
                  >
                    <Card
                      className={
                        selectedSessionId === session.id
                          ? "border-[var(--accent)] shadow-[0_18px_45px_rgba(242,99,0,0.16)]"
                          : ""
                      }
                    >
                      <CardHeader>
                        <CardTitle>{session.title}</CardTitle>
                        <CardDescription>
                          {formatDate(session.date)}
                          {session.location ? ` - ${session.location}` : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        <StatusBadge tone={open ? "green" : "gold"}>
                          {open ? "Ouvert" : "Ferme"}
                        </StatusBadge>
                        <StatusBadge tone="blue">
                          {session.registrations.length} inscrit(s)
                        </StatusBadge>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
            </div>

            {selectedSession ? (
              <Card id={`mivhan-${selectedSession.id}`}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>{selectedSession.title}</CardTitle>
                      <CardDescription>
                        Detail du mivhan, inscriptions et resultats.
                      </CardDescription>
                    </div>
                    <AddRegistrationDialog sessionId={selectedSession.id} />
                  </div>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <MivhanSettingsForm session={selectedSession} />

                  <div className="relative max-w-xl">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
                    <Input
                      className="pl-9"
                      onChange={(event) => setQuery(event.currentTarget.value)}
                      placeholder="Rechercher un Bahour, email, yeshiva, massehet..."
                      value={query}
                    />
                  </div>

                  <div className="table-wrap">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bahour</TableHead>
                          <TableHead>Yeshiva</TableHead>
                          <TableHead>Limoud</TableHead>
                          <TableHead>Note</TableHead>
                          <TableHead>Recompense</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRegistrations.map((registration) => (
                          <TableRow
                            id={`registration-${registration.id}`}
                            key={registration.id}
                          >
                            <TableCell>
                              <div className="grid gap-1">
                                <strong>{registrationName(registration)}</strong>
                                <span className="text-sm text-[var(--muted)]">
                                  {registration.email ?? registration.user?.email}
                                </span>
                                <span className="text-sm text-[var(--muted)]">
                                  {registration.phone ?? registration.user?.phone}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {registration.yeshiva ?? registration.user?.yeshiva ?? "-"}
                            </TableCell>
                            <TableCell>
                              <div className="grid gap-1">
                                <strong>{registration.massehet ?? "-"}</strong>
                                <span className="text-sm text-[var(--muted)]">
                                  {registration.dapim
                                    ? dapimRangesToHebrew(registration.dapim)
                                    : registration.dafStart && registration.dafEnd
                                      ? `${registration.dafStart} - ${registration.dafEnd}`
                                      : "-"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {registration.grade === null
                                ? "A saisir"
                                : `${registration.grade} / 100`}
                            </TableCell>
                            <TableCell>
                              <div className="grid gap-1">
                                <span>
                                  {formatReward(
                                    registration.rewardAmountCents,
                                    registration.rewardCurrency,
                                  )}
                                </span>
                                {registration.rewardPaid ? (
                                  <StatusBadge tone="green">Donnee</StatusBadge>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell>
                              {registration.resultEmailSentAt ? (
                                <StatusBadge tone="green">Envoye</StatusBadge>
                              ) : registration.grade !== null ? (
                                <StatusBadge tone="gold">Non envoye</StatusBadge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                <EditRegistrationDialog registration={registration} />
                                <ResultDialog registration={registration} />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredRegistrations.length === 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Aucune inscription</CardTitle>
                        <CardDescription>
                          Aucune inscription ne correspond a ce mivhan ou a la
                          recherche actuelle.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </section>
    </>
  );
}
