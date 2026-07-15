import { AdminShell } from "@/components/admin-sidebar";
import { StatusBadge } from "@/app/components";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  createAdminTalmoudoRegistration,
  createMivhanSession,
  updateMivhanRegistrationResult,
  updateMivhanSessionSettings,
} from "./actions";
import {
  getMivhanRegistrationCloseDate,
  isMivhanRegistrationOpen,
} from "@/lib/talmoudo-beyado";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { CalendarPlus, ClipboardCheck, Plus, Trophy } from "lucide-react";

export const metadata = {
  title: "Admin Talmoudo Beyado",
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

function formatReward(amountCents: number | null, currency: string) {
  if (amountCents === null) return "Non renseigne";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

function registrationName(registration: {
  firstName: string | null;
  lastName: string | null;
  user: { firstName: string | null; lastName: string | null; name: string } | null;
}) {
  return (
    [registration.firstName, registration.lastName].filter(Boolean).join(" ") ||
    [registration.user?.firstName, registration.user?.lastName]
      .filter(Boolean)
      .join(" ") ||
    registration.user?.name ||
    "Sans nom"
  );
}

export default async function AdminTalmoudoBeyadoPage() {
  await requireAdminUser();
  const sessions = await prisma.mivhanSession.findMany({
    include: {
      registrations: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { date: "desc" },
  });
  const totalRegistrations = sessions.reduce(
    (total, session) => total + session.registrations.length,
    0,
  );
  const gradedCount = sessions.reduce(
    (total, session) =>
      total + session.registrations.filter((item) => item.grade !== null).length,
    0,
  );

  return (
    <AdminShell>
      <div className="admin-header">
        <div>
          <span className="eyebrow">Programme</span>
          <h1>Talmoudo Beyado</h1>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}>
            <CalendarPlus />
            Nouveau mivhan
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Creer un mivhan</DialogTitle>
              <DialogDescription>
                Fixez la date mensuelle, le lieu et le delai de fermeture des
                inscriptions.
              </DialogDescription>
            </DialogHeader>
            <form action={createMivhanSession} className="grid gap-4">
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
                    min={0}
                    max={30}
                    name="registrationCloseDaysBefore"
                    required
                    type="number"
                  />
                </div>
              </div>
              <Button type="submit">
                <Plus />
                Creer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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

        <div className="mt-6 grid gap-6">
          {sessions.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Aucun mivhan</CardTitle>
                <CardDescription>
                  Creez le premier mivhan mensuel pour ouvrir les inscriptions.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            sessions.map((session) => {
              const open = isMivhanRegistrationOpen(session);
              const closeDate = getMivhanRegistrationCloseDate(session);

              return (
                <Card id={`mivhan-${session.id}`} key={session.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <CardTitle>{session.title}</CardTitle>
                        <CardDescription>
                          {formatDate(session.date)}
                          {session.location ? ` - ${session.location}` : ""}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge tone={open ? "green" : "gold"}>
                          {open ? "Inscriptions ouvertes" : "Inscriptions fermees"}
                        </StatusBadge>
                        <StatusBadge tone="blue">
                          {session.registrations.length} inscrit(s)
                        </StatusBadge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-5">
                    <form
                      action={updateMivhanSessionSettings}
                      className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-4"
                    >
                      <input name="sessionId" type="hidden" value={session.id} />
                      <div className="form-grid">
                        <div className="grid gap-2">
                          <Label htmlFor={`title-${session.id}`}>Titre</Label>
                          <Input
                            defaultValue={session.title}
                            id={`title-${session.id}`}
                            name="title"
                            required
                          />
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
                          <Input
                            defaultValue={session.location ?? ""}
                            id={`location-${session.id}`}
                            name="location"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`close-${session.id}`}>
                            Fermeture X jours avant
                          </Label>
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
                        Fermeture automatique prevue le {formatDate(closeDate)}.
                      </p>
                      <Button className="w-fit" type="submit" variant="secondary">
                        Enregistrer les reglages
                      </Button>
                    </form>

                    <Dialog>
                      <DialogTrigger render={<Button className="w-fit" variant="secondary" />}>
                        <Plus />
                        Inscrire un Bahour
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Inscription admin</DialogTitle>
                          <DialogDescription>
                            Vous pouvez inscrire un utilisateur existant ou creer
                            son compte a partir de son email.
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          action={createAdminTalmoudoRegistration}
                          className="grid gap-4"
                        >
                          <input name="sessionId" type="hidden" value={session.id} />
                          <div className="form-grid">
                            <Input name="firstName" placeholder="Prenom" required />
                            <Input name="lastName" placeholder="Nom" required />
                            <Input name="email" placeholder="Email" required type="email" />
                            <Input name="phone" placeholder="Telephone" required />
                            <Input name="parentPhone" placeholder="Telephone parents" />
                            <Input name="yeshiva" placeholder="Yeshiva" required />
                            <Input name="massehet" placeholder="Massehet" required />
                            <Input name="dafStart" placeholder="Du daf" required />
                            <Input name="dafEnd" placeholder="Au daf" required />
                          </div>
                          <Button type="submit">Inscrire</Button>
                        </form>
                      </DialogContent>
                    </Dialog>

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
                          {session.registrations.map((registration) => (
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
                                    {registration.dafStart && registration.dafEnd
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
                                <Dialog>
                                  <DialogTrigger render={<Button size="sm" variant="secondary" />}>
                                    <ClipboardCheck />
                                    Resultat
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-xl">
                                    <DialogHeader>
                                      <DialogTitle>Note et recompense</DialogTitle>
                                      <DialogDescription>
                                        La note et la recompense sont renseignees
                                        ensemble. Un email est envoye au Bahour.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <form
                                      action={updateMivhanRegistrationResult}
                                      className="grid gap-4"
                                    >
                                      <input
                                        name="registrationId"
                                        type="hidden"
                                        value={registration.id}
                                      />
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
                                      <Button type="submit">
                                        <Trophy />
                                        Enregistrer et envoyer l&apos;email
                                      </Button>
                                    </form>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {session.registrations.length === 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Aucune inscription</CardTitle>
                          <CardDescription>
                            Les inscriptions de ce mivhan apparaitront ici.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </AdminShell>
  );
}
