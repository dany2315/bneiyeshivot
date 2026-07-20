"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TalmoudoRegistrationForm } from "@/components/talmoudo-registration-form";
import { CalendarDays, MapPin, Plus, Trophy, XIcon } from "lucide-react";

type TalmoudoSessionOption = {
  disabled?: boolean;
  id: string;
  title: string;
  dateLabel: string;
  location?: string | null;
};

type TalmoudoInitialUser = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  parentPhone?: string | null;
  yeshiva?: string | null;
};

export function BahourMivhanSignupCards({
  initialUser,
  sessions,
}: {
  initialUser: TalmoudoInitialUser;
  sessions: TalmoudoSessionOption[];
}) {
  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-2">
      {sessions.map((session) => (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-white px-3 py-2 shadow-sm"
          key={session.id}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[var(--subtle)] text-[var(--accent)]">
              <Trophy className="size-4" />
            </span>
            <div className="min-w-0">
              <strong className="block truncate text-sm text-[var(--primary)]">
                {session.title}
              </strong>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  {session.dateLabel}
                </span>
                {session.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {session.location}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <Dialog>
            <DialogTrigger
              render={<Button disabled={session.disabled} size="sm" variant="secondary" />}
            >
              <Plus className="size-4" />
              S’inscrire
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
            >
              <DialogHeader className="grid shrink-0 grid-cols-[1fr_auto] items-start gap-3 border-b border-[var(--border)] bg-popover p-4">
                <div className="grid gap-2">
                  <DialogTitle>{session.title}</DialogTitle>
                  <DialogDescription>
                    Complétez votre massehet et vos plages de dapim pour ce
                    mivhan.
                  </DialogDescription>
                </div>
                <DialogClose
                  render={
                    <Button
                      aria-label="Fermer"
                      variant="ghost"
                      size="icon-sm"
                    />
                  }
                >
                  <XIcon className="size-4" />
                </DialogClose>
              </DialogHeader>
              <div className="min-h-0 max-h-[calc(92dvh-96px)] flex-1 overflow-y-auto overscroll-contain p-4">
                <TalmoudoRegistrationForm
                  compact
                  initialUser={initialUser}
                  sessions={[session]}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ))}
    </div>
  );
}
