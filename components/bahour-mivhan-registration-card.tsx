"use client";

import { TalmoudoLimoudFields } from "@/components/talmoudo-limoud-fields";
import { TalmoudoDialogActionForm } from "@/components/talmoudo-action-form";
import { StatusBadge } from "@/app/components";
import { updateBahourTalmoudoRegistrationState } from "@/app/client/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit3, Trophy } from "lucide-react";
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Trophy className="mb-2 size-5 text-[var(--accent)]" />
            <CardTitle>{registration.session.title}</CardTitle>
            <CardDescription>{dateLabel}</CardDescription>
          </div>
          {canEdit ? (
            <TalmoudoDialogActionForm
              action={updateBahourTalmoudoRegistrationState}
              className="sm:max-w-3xl"
              description="Vous pouvez modifier votre massehet et vos dapim tant que les inscriptions sont ouvertes."
              submitLabel="Enregistrer"
              title="Modifier mon inscription"
              trigger={
                <Button size="sm" variant="secondary">
                  <Edit3 />
                  Modifier
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
      </CardHeader>
      <CardContent className="grid gap-3">
        <StatusBadge tone={registration.grade === null ? "blue" : "green"}>
          {registration.grade === null
            ? "Inscrit"
            : `${registration.grade} / 100`}
        </StatusBadge>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-3">
          <strong className="text-[var(--primary)]">
            {registration.massehet ?? "Massehet"}
          </strong>
          <p className="text-sm text-[var(--muted)]">{dapimLabel}</p>
        </div>
        <div className="grid gap-1 text-sm text-[var(--muted)]">
          <span>
            Recompense :{" "}
            {formatReward(
              registration.rewardAmountCents,
              registration.rewardCurrency,
            )}
          </span>
          <span>
            Statut :{" "}
            {registration.rewardPaid ? "recompense donnee" : "en attente"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
