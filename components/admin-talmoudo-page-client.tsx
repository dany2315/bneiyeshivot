"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StatusBadge } from "@/app/components";
import {
  createAdminTalmoudoRegistrationState,
  createMivhanSessionState,
  deleteMivhanSessionState,
  setMivhanSessionClosedState,
  updateAdminTalmoudoRegistrationState,
  updateMivhanRegistrationResultState,
  updateMivhanSessionSettingsState,
  type TalmoudoActionState,
} from "@/app/admin/talmoudo-beyado/actions";
import {
  TalmoudoActionButton,
  TalmoudoDialogActionForm,
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
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CalendarPlus,
  BookOpen,
  ClipboardCheck,
  Edit3,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Unlock,
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
  if (amountCents === null) return "Non renseigné";

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

function sessionStats(session: AdminSession) {
  const total = session.registrations.length;
  const graded = session.registrations.filter((item) => item.grade !== null).length;
  const paid = session.registrations.filter((item) => item.rewardPaid).length;
  const unpaid = session.registrations.filter((item) => !item.rewardPaid).length;

  return { total, graded, paid, unpaid };
}

function masechtotStats(registrations: AdminRegistration[]) {
  const counts = new Map<string, number>();

  registrations.forEach((registration) => {
    const key = registration.massehet?.trim() || "Non renseignée";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function EditMivhanDialog({ session }: { session: AdminSession }) {
  return (
    <TalmoudoDialogActionForm
      action={updateMivhanSessionSettingsState}
      className="sm:max-w-2xl"
      description="Modifiez la date, le lieu, le délai de fermeture et le statut des inscriptions."
      submitLabel="Enregistrer les réglages"
      title="Modifier le mivhan"
      trigger={
        <Button className="w-full justify-start" size="sm" variant="secondary">
          <Edit3 />
          Modifier
        </Button>
      }
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
        Fermeture automatique prévue le {formatDate(getCloseDate(session))}.
      </p>
    </TalmoudoDialogActionForm>
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
        placeholder="Prénom"
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
        placeholder="Téléphone"
        required
      />
      <Input
        defaultValue={registration?.user?.parentPhone ?? ""}
        name="parentPhone"
        placeholder="Téléphone des parents"
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
      description="Vous pouvez inscrire un utilisateur existant ou créer son compte à partir de son email."
      submitLabel="Inscrire"
      title="Inscription admin"
      trigger={
        <Button className="w-full justify-start" size="sm" variant="secondary">
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

function DeleteMivhanDialog({ session }: { session: AdminSession }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const initialState: TalmoudoActionState = { ok: false, message: "" };
  const [state, formAction, pending] = useActionState(
    deleteMivhanSessionState,
    initialState,
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      window.setTimeout(() => setOpen(false), 0);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button className="w-full justify-start" size="sm" variant="destructive" />
        }
      >
        <Trash2 />
        Supprimer
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce mivhan ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action supprimera le mivhan &quot;{session.title}&quot; et
            toutes ses inscriptions. Elle est définitive.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Non</AlertDialogCancel>
          <form action={formAction}>
            <input name="sessionId" type="hidden" value={session.id} />
            <AlertDialogAction disabled={pending} type="submit">
              Oui, je supprime
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
      description="Modifiez les informations de l’inscription de ce mivhan."
      submitLabel="Enregistrer"
      title="Modifier l’inscription"
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
      description="La note et la récompense sont renseignées ensemble. Un email est envoyé au Bahour."
      submitLabel="Enregistrer et envoyer l’email"
      title="Note et récompense"
      trigger={
        <Button size="sm" variant="secondary">
          <ClipboardCheck />
          Résultat
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
          <Label>Montant récompense</Label>
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
        Récompense déjà donnée
      </label>
      <Input
        defaultValue={registration.note ?? ""}
        name="note"
        placeholder="Note interne ou commentaire"
      />
    </TalmoudoDialogActionForm>
  );
}

function SessionActionsMenu({ session }: { session: AdminSession }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Actions du mivhan"
            size="icon-sm"
            type="button"
            variant="secondary"
          />
        }
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
        <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">
          Actions du mivhan
        </div>
        <div>
          <EditMivhanDialog session={session} />
        </div>
        <div className="mt-1">
          <AddRegistrationDialog sessionId={session.id} />
        </div>
        <div className="mt-1">
          <TalmoudoActionButton
            action={setMivhanSessionClosedState}
            fields={{
              sessionId: session.id,
              registrationsClosed: session.registrationsClosed
                ? "false"
                : "true",
            }}
          >
            {session.registrationsClosed ? (
              <>
                <Unlock />
                Ouvrir les inscriptions
              </>
            ) : (
              <>
                <Lock />
                Fermer les inscriptions
              </>
            )}
          </TalmoudoActionButton>
        </div>
        <DropdownMenuSeparator className="my-2" />
        <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-destructive">
          Zone sensible
        </div>
        <div>
          <DeleteMivhanDialog session={session} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
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
  const [registrationView, setRegistrationView] = useState("all");
  const selectedSession = sessions.find((session) => session.id === selectedSessionId);
  const selectedStats = selectedSession ? sessionStats(selectedSession) : null;
  const selectedMasechtotStats = selectedSession
    ? masechtotStats(selectedSession.registrations)
    : [];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRegistrations = selectedSession
    ? selectedSession.registrations
        .filter((registration) => {
          if (registrationView === "paid") return registration.rewardPaid;
          if (registrationView === "unpaid") return !registration.rewardPaid;
          if (registrationView === "graded") return registration.grade !== null;
          if (registrationView === "pending-grade") return registration.grade === null;
          return true;
        })
        .filter((registration) =>
          normalizedQuery
            ? registrationSearchText(registration).includes(normalizedQuery)
            : true,
        )
    : [];

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
          description="Fixez la date mensuelle, le lieu et le délai de fermeture des inscriptions."
          submitLabel="Créer"
          title="Créer un mivhan"
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
              <Input id="new-location" name="location" placeholder="Jérusalem" />
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
        <div className="section-header">
          <div>
            <span className="eyebrow">Indicateurs</span>
            <h2>Pilotage Talmoudo Beyado</h2>
          </div>
        </div>
        <div className="grid grid-3">
          <Card>
            <CardHeader>
              <CardTitle>{sessions.length}</CardTitle>
              <CardDescription>Mivhanim créés</CardDescription>
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
              <CardDescription>Résultats renseignés</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="section-header mt-8">
          <div>
            <span className="eyebrow">Mivhanim</span>
            <h2>Gestion par mivhan</h2>
          </div>
          <p>
            Sélectionnez un mivhan pour voir ses inscriptions, rechercher un
            Bahour et mettre à jour les résultats.
          </p>
        </div>

        {sessions.length === 0 ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Aucun mivhan</CardTitle>
              <CardDescription>
                Créez le premier mivhan mensuel pour ouvrir les inscriptions.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6">
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3">
              {sessions.map((session) => {
                const open = isOpen(session);
                const stats = sessionStats(session);

                return (
                  <Card
                    className={
                      selectedSessionId === session.id
                        ? "min-w-[280px] border-[var(--accent)] shadow-[0_14px_34px_rgba(242,99,0,0.14)]"
                        : "min-w-[280px]"
                    }
                    key={session.id}
                  >
                    <CardHeader
                      className="cursor-pointer gap-2 p-4"
                      onClick={() => {
                        setSelectedSessionId(session.id);
                        setQuery("");
                        setRegistrationView("all");
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="truncate text-base">
                            {session.title}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {formatDate(session.date)}
                            {session.location ? ` - ${session.location}` : ""}
                          </CardDescription>
                        </div>
                        <div onClick={(event) => event.stopPropagation()}>
                          <SessionActionsMenu session={session} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent
                      className="grid cursor-pointer gap-3 px-4 pb-4 pt-0"
                      onClick={() => {
                        setSelectedSessionId(session.id);
                        setQuery("");
                        setRegistrationView("all");
                      }}
                    >
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge tone={open ? "green" : "gold"}>
                          {open ? "Ouvert" : "Fermé"}
                        </StatusBadge>
                        <StatusBadge tone="blue">
                          {stats.total} inscrit(s)
                        </StatusBadge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-md bg-[var(--subtle)] px-2 py-1">
                          <strong className="block text-sm text-[var(--primary)]">
                            {stats.graded}
                          </strong>
                          <span className="text-[11px] text-[var(--muted)]">notes</span>
                        </div>
                        <div className="rounded-md bg-[var(--subtle)] px-2 py-1">
                          <strong className="block text-sm text-[var(--primary)]">
                            {stats.paid}
                          </strong>
                          <span className="text-[11px] text-[var(--muted)]">payés</span>
                        </div>
                        <div className="rounded-md bg-[var(--subtle)] px-2 py-1">
                          <strong className="block text-sm text-[var(--primary)]">
                            {stats.unpaid}
                          </strong>
                          <span className="text-[11px] text-[var(--muted)]">à payer</span>
                        </div>
                      </div>
                      <p className="truncate text-xs text-[var(--muted)]">
                        Fermé le {formatDate(getCloseDate(session))}
                      </p>
                    </CardContent>
                  </Card>
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
                        Détail du mivhan, inscriptions et résultats.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-5">
                  {selectedStats ? (
                    <div className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--subtle)] p-4">
                      <div className="grid gap-3 md:grid-cols-4">
                        <div>
                          <span className="text-xs font-semibold uppercase text-[var(--muted)]">
                            Inscriptions
                          </span>
                          <p className="mt-1 text-2xl font-bold text-[var(--primary)]">
                            {selectedStats.total}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase text-[var(--muted)]">
                            Notes saisies
                          </span>
                          <p className="mt-1 text-2xl font-bold text-[var(--primary)]">
                            {selectedStats.graded}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase text-[var(--muted)]">
                            Payés
                          </span>
                          <p className="mt-1 text-2xl font-bold text-[var(--primary)]">
                            {selectedStats.paid}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase text-[var(--muted)]">
                            À payer
                          </span>
                          <p className="mt-1 text-2xl font-bold text-[var(--primary)]">
                            {selectedStats.unpaid}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-[var(--primary)]">
                          <BookOpen className="size-4 text-[var(--accent)]" />
                          Répartition par massehet
                        </div>
                        {selectedMasechtotStats.length > 0 ? (
                          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                            {selectedMasechtotStats.map((item) => (
                              <div
                                className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm"
                                key={item.name}
                              >
                                <span className="truncate font-medium text-[var(--primary)]">
                                  {item.name}
                                </span>
                                <span className="rounded-full bg-[var(--subtle)] px-2 py-0.5 text-xs font-bold text-[var(--muted)]">
                                  {item.count}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-[var(--muted)]">
                            Aucune massehet renseignée pour ce mivhan.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <Tabs
                      value={registrationView}
                      onValueChange={setRegistrationView}
                    >
                      <TabsList className="w-full flex-wrap justify-start border-[var(--border)] bg-white text-[var(--primary)] shadow-sm">
                        <TabsTrigger
                          className="text-[var(--primary)] data-active:bg-[var(--primary)] data-active:text-white hover:bg-[var(--subtle)]"
                          value="all"
                        >
                          Inscriptions ({selectedStats?.total ?? 0})
                        </TabsTrigger>
                        <TabsTrigger
                          className="text-[var(--primary)] data-active:bg-[var(--primary)] data-active:text-white hover:bg-[var(--subtle)]"
                          value="graded"
                        >
                          Notes ({selectedStats?.graded ?? 0})
                        </TabsTrigger>
                        <TabsTrigger
                          className="text-[var(--primary)] data-active:bg-[var(--primary)] data-active:text-white hover:bg-[var(--subtle)]"
                          value="pending-grade"
                        >
                          À noter ({(selectedStats?.total ?? 0) - (selectedStats?.graded ?? 0)})
                        </TabsTrigger>
                        <TabsTrigger
                          className="text-[var(--primary)] data-active:bg-[var(--primary)] data-active:text-white hover:bg-[var(--subtle)]"
                          value="paid"
                        >
                          Payés ({selectedStats?.paid ?? 0})
                        </TabsTrigger>
                        <TabsTrigger
                          className="text-[var(--primary)] data-active:bg-[var(--primary)] data-active:text-white hover:bg-[var(--subtle)]"
                          value="unpaid"
                        >
                          À payer ({selectedStats?.unpaid ?? 0})
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <div className="relative w-full lg:max-w-md">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
                      <Input
                        className="pl-9"
                        onChange={(event) => setQuery(event.currentTarget.value)}
                        placeholder="Rechercher Bahour, email, yeshiva, massehet..."
                        value={query}
                      />
                    </div>
                  </div>

                  <div className="table-wrap">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bahour</TableHead>
                          <TableHead>Yeshiva</TableHead>
                          <TableHead>Limoud</TableHead>
                          <TableHead>Note</TableHead>
                          <TableHead>Récompense</TableHead>
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
                                ? "À saisir"
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
                                  <StatusBadge tone="green">Donnée</StatusBadge>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell>
                              {registration.resultEmailSentAt ? (
                                <StatusBadge tone="green">Envoyé</StatusBadge>
                              ) : registration.grade !== null ? (
                                <StatusBadge tone="gold">Non envoyé</StatusBadge>
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
                          Aucune inscription ne correspond à ce mivhan ou à la
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
