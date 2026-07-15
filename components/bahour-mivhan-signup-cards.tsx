"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TalmoudoRegistrationForm } from "@/components/talmoudo-registration-form";
import { CalendarDays, MapPin, Trophy } from "lucide-react";

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
              <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-4xl">
                <DialogHeader className="sticky top-0 z-20 border-b border-[var(--border)] bg-popover p-4 pr-12">
                  <DialogTitle>{session.title}</DialogTitle>
                  <DialogDescription>
                    Completez votre massehet et vos plages de dapim pour ce
                    mivhan.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[calc(92vh-96px)] overflow-y-auto p-4">
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
