"use client";

import { TalmoudoLimoudFields } from "@/components/talmoudo-limoud-fields";
import { TalmoudoDialogActionForm } from "@/components/talmoudo-action-form";
import { StatusBadge } from "@/app/components";
import { updateBahourTalmoudoRegistrationState } from "@/app/client/actions";
import { Button } from "@/components/ui/button";
import { CalendarDays, Edit3, Trophy } from "lucide-react";
import { dapimRangesToHebrew } from "@/lib/shas";

type BahourMivhanRegistration = {
  id: string;
  massehet: string | null;
  dapim: string | null;
  dafStart: string | null;
  dafEnd: string | null;
  grade: number | null;
  rewardAmountCents: number | null;
  rewardCurrency: string;
  rewardPaid: boolean;
  session: {
    title: string;
    date: Date;
  };
};

function formatReward(amountCents: number | null, currency: string) {
  if (amountCents === null) return "0";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

export function BahourMivhanRegistrationCard({
  canEdit,
  dateLabel,
  registration,
}: {
  canEdit: boolean;
  dateLabel: string;
  registration: BahourMivhanRegistration;
}) {
  const dapimLabel = registration.dapim
    ? dapimRangesToHebrew(registration.dapim)
    : registration.dafStart && registration.dafEnd
      ? `Du daf ${registration.dafStart} au daf ${registration.dafEnd}`
      : "Dapim a confirmer";

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-[var(--subtle)] text-[var(--accent)]">
            <Trophy className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="truncate text-sm text-[var(--primary)]">
                {registration.session.title}
              </strong>
              <StatusBadge tone={registration.grade === null ? "blue" : "green"}>
                {registration.grade === null
                  ? "Inscrit"
                  : `${registration.grade} / 100`}
              </StatusBadge>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {dateLabel}
              </span>
              <span className="font-medium text-[var(--primary)]">
                {registration.massehet ?? "Massehet"}
              </span>
              <span>{dapimLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
          <span className="rounded-md bg-[var(--subtle)] px-2 py-1">
            {formatReward(
              registration.rewardAmountCents,
              registration.rewardCurrency,
            )}
          </span>
          <span>{registration.rewardPaid ? "Donnee" : "En attente"}</span>
          {canEdit ? (
            <TalmoudoDialogActionForm
              action={updateBahourTalmoudoRegistrationState}
              className="sm:max-w-3xl"
              description="Vous pouvez modifier votre massehet et vos dapim tant que les inscriptions sont ouvertes."
              submitLabel="Enregistrer"
              title="Modifier mon inscription"
              trigger={
                <Button size="icon-sm" variant="secondary" aria-label="Modifier">
                  <Edit3 />
                </Button>
              }
            >
              <input name="registrationId" type="hidden" value={registration.id} />
              <div className="form-grid">
                <TalmoudoLimoudFields
                  defaultDapim={registration.dapim}
                  defaultMasechet={registration.massehet}
                />
              </div>
            </TalmoudoDialogActionForm>
          ) : null}
        </div>
      </div>
    </div>
  );
}
