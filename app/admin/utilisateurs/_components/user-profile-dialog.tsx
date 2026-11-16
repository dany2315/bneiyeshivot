"use client";

import { type ReactElement, type ReactNode, useState } from "react";
import Link from "next/link";
import { UserAccountType, UserRole } from "@prisma/client";
import {
  CalendarCheck,
  Gift,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteUser,
  getUserActivity,
  updateUserDetails,
  type UserActivity,
} from "../../actions";
import { StatusBadge } from "@/app/components";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type UserProfileData = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  name: string;
  email: string;
  phone: string | null;
  parentPhone: string | null;
  yeshiva: string | null;
  accountType: UserAccountType;
  role: UserRole;
};

const accountTypeLabels: Record<UserAccountType, string> = {
  BAHOUR: "Bahour",
  YESHIVA: "Yeshiva",
};

const roleLabels: Record<UserRole, string> = {
  CLIENT: "Bahour",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super admin",
};

export function userDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  name: string;
}) {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    "Sans nom"
  );
}

function actionErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function ActivitySection({
  title,
  icon,
  empty,
  children,
}: {
  title: string;
  icon: ReactNode;
  empty: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2 text-sm font-bold text-[var(--primary)]">
        {icon}
        {title}
      </div>
      {empty ? (
        <p className="text-sm text-[var(--muted)]">Aucune pour le moment.</p>
      ) : (
        <div className="grid gap-1.5">{children}</div>
      )}
    </div>
  );
}

export function UserProfileDialog({
  user,
  trigger,
}: {
  user: UserProfileData;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName = userDisplayName(user);
  const telHref = user.phone ? `tel:${user.phone.replace(/\s+/g, "")}` : null;

  async function loadActivity() {
    setLoadingActivity(true);
    try {
      const data = await getUserActivity(user.id);
      setActivity(data);
    } catch {
      toast.error("Impossible de charger l’activité de l’utilisateur.");
    } finally {
      setLoadingActivity(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setEditMode(false);
      if (!activity && !loadingActivity) {
        void loadActivity();
      }
    }
  }

  async function handleSave(formData: FormData) {
    setIsSaving(true);
    const toastId = toast.loading("Mise à jour des coordonnées...");
    try {
      await updateUserDetails(formData);
      toast.success("Coordonnées mises à jour.", { id: toastId });
      setEditMode(false);
    } catch (error) {
      toast.error(
        actionErrorMessage(error, "Impossible de mettre à jour les coordonnées."),
        { id: toastId },
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(formData: FormData) {
    setIsDeleting(true);
    const toastId = toast.loading("Suppression de l’utilisateur...");
    try {
      await deleteUser(formData);
      toast.success("Utilisateur supprimé.", { id: toastId });
      setOpen(false);
    } catch (error) {
      toast.error(
        actionErrorMessage(error, "Impossible de supprimer l’utilisateur."),
        { id: toastId },
      );
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as ReactElement)
          ) : (
            <button
              className="text-left font-semibold text-[var(--primary)] transition hover:text-[var(--accent-strong)] hover:underline"
              type="button"
            >
              {displayName}
            </button>
          )
        }
      />
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{displayName}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={user.accountType === "YESHIVA" ? "gold" : "green"}>
            {accountTypeLabels[user.accountType]}
          </StatusBadge>
          <StatusBadge
            tone={
              user.role === "SUPER_ADMIN"
                ? "gold"
                : user.role === "ADMIN"
                  ? "blue"
                  : "green"
            }
          >
            {roleLabels[user.role]}
          </StatusBadge>
        </div>

        {/* Boutons de contact */}
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary">
            <a href={`mailto:${user.email}`}>
              <Mail className="size-4" />
              Envoyer un mail
            </a>
          </Button>
          {telHref ? (
            <Button asChild size="sm" variant="secondary">
              <a href={telHref}>
                <Phone className="size-4" />
                Appeler
              </a>
            </Button>
          ) : null}
        </div>

        {/* Coordonnées / édition */}
        {editMode ? (
          <form action={handleSave} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-3">
            <input name="userId" type="hidden" value={user.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="user-firstName">Prénom</Label>
                <Input
                  defaultValue={user.firstName ?? ""}
                  id="user-firstName"
                  name="firstName"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="user-lastName">Nom</Label>
                <Input
                  defaultValue={user.lastName ?? ""}
                  id="user-lastName"
                  name="lastName"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="user-phone">Téléphone</Label>
                <Input
                  defaultValue={user.phone ?? ""}
                  id="user-phone"
                  name="phone"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="user-parentPhone">Téléphone parent</Label>
                <Input
                  defaultValue={user.parentPhone ?? ""}
                  id="user-parentPhone"
                  name="parentPhone"
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="user-yeshiva">Yeshiva</Label>
                <Input
                  defaultValue={user.yeshiva ?? ""}
                  id="user-yeshiva"
                  name="yeshiva"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled={isSaving} size="sm" type="submit">
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                Enregistrer
              </Button>
              <Button
                onClick={() => setEditMode(false)}
                size="sm"
                type="button"
                variant="ghost"
              >
                Annuler
              </Button>
            </div>
          </form>
        ) : (
          <dl className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Téléphone</dt>
              <dd className="font-medium">{user.phone || "-"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Téléphone parent</dt>
              <dd className="font-medium">{user.parentPhone || "-"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Yeshiva</dt>
              <dd className="font-medium">{user.yeshiva || "-"}</dd>
            </div>
          </dl>
        )}

        {/* Activité */}
        <div className="grid gap-4">
          {loadingActivity ? (
            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <Loader2 className="size-4 animate-spin" />
              Chargement de l’activité...
            </div>
          ) : activity ? (
            <>
              <ActivitySection
                empty={activity.requests.length === 0}
                icon={<CalendarCheck className="size-4" />}
                title={`Demandes (${activity.requests.length})`}
              >
                {activity.requests.map((request) => (
                  <div
                    className="flex items-center justify-between gap-3 text-sm"
                    key={request.id}
                  >
                    <span className="font-medium">{request.label}</span>
                    <span className="text-[var(--muted)]">
                      {request.status} - {request.date}
                    </span>
                  </div>
                ))}
              </ActivitySection>

              <ActivitySection
                empty={activity.donations.length === 0}
                icon={<Gift className="size-4" />}
                title={`Dons (${activity.donations.length})`}
              >
                {activity.donations.map((donation) => (
                  <div
                    className="flex items-center justify-between gap-3 text-sm"
                    key={donation.id}
                  >
                    <span className="font-medium">{donation.amount}</span>
                    <span className="text-[var(--muted)]">
                      {donation.status} - {donation.date}
                    </span>
                  </div>
                ))}
              </ActivitySection>

              <ActivitySection
                empty={activity.registrations.length === 0}
                icon={<CalendarCheck className="size-4" />}
                title={`Inscriptions (${activity.registrations.length})`}
              >
                {activity.registrations.map((registration) => (
                  <div
                    className="flex items-center justify-between gap-3 text-sm"
                    key={registration.id}
                  >
                    <span className="font-medium">{registration.event}</span>
                    <span className="text-[var(--muted)]">
                      {registration.status} - {registration.date}
                    </span>
                  </div>
                ))}
              </ActivitySection>

              <Link
                className="text-sm font-medium text-[var(--accent-strong)] hover:underline"
                href={`/admin/dons?q=${encodeURIComponent(user.email)}`}
              >
                Voir tous ses dons dans la page Dons
              </Link>
            </>
          ) : null}
        </div>

        {/* Actions bas de fiche */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
          {!editMode ? (
            <Button
              onClick={() => setEditMode(true)}
              size="sm"
              variant="secondary"
            >
              <Pencil className="size-4" />
              Modifier les coordonnées
            </Button>
          ) : (
            <span />
          )}

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  className="text-red-700 hover:bg-red-50 hover:text-red-800"
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                  Supprimer
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Supprimer {displayName} ?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Action irréversible. Le compte et ses accès seront
                  définitivement supprimés. Ses dons, demandes et inscriptions
                  sont conservés mais ne seront plus rattachés à ce compte.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <form action={handleDelete}>
                  <input name="userId" type="hidden" value={user.id} />
                  <AlertDialogAction
                    disabled={isDeleting}
                    type="submit"
                    variant="destructive"
                  >
                    {isDeleting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    Supprimer définitivement
                  </AlertDialogAction>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <DialogClose
          render={<Button variant="ghost" />}
          className="justify-self-end"
        >
          Fermer
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
