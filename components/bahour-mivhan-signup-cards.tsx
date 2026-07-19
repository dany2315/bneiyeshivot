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
import { Card, CardContent } from "@/components/ui/card";
import { TalmoudoRegistrationForm } from "@/components/talmoudo-registration-form";
import { CalendarDays, MapPin, Trophy, XIcon } from "lucide-react";

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
    <div className="grid gap-3">
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex min-w-0 items-center gap-4">
              <span className="icon-box">
                <Trophy className="size-4" />
              </span>
              <div className="grid gap-1">
                <strong className="text-lg text-[var(--primary)]">
                  {session.title}
                </strong>
                <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4" />
                    {session.dateLabel}
                  </span>
                  {session.location ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" />
                      {session.location}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <Dialog>
              <DialogTrigger render={<Button disabled={session.disabled} />}>
                S&apos;inscrire a ce mivhan
              </DialogTrigger>
              <DialogContent
                showCloseButton={false}
                className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
              >
                <DialogHeader className="shrink-0 grid grid-cols-[1fr_auto] items-start gap-3 border-b border-[var(--border)] bg-popover p-4">
                  <div className="grid gap-2">
                    <DialogTitle>{session.title}</DialogTitle>
                    <DialogDescription>
                      Completez votre massehet et vos plages de dapim pour ce
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
