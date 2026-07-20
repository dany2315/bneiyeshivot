"use client";

import Link from "next/link";
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
import { CalendarDays, CheckCircle2, MapPin, Send, XIcon } from "lucide-react";

type TalmoudoSessionOption = {
  disabled?: boolean;
  id: string;
  location?: string | null;
  title: string;
  dateLabel: string;
};

type TalmoudoInitialUser = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  parentPhone?: string | null;
  yeshiva?: string | null;
};

export function TalmoudoProgramSignupCta({
  alreadyRegistered,
  initialUser,
  session,
}: {
  alreadyRegistered: boolean;
  initialUser?: TalmoudoInitialUser | null;
  session?: TalmoudoSessionOption | null;
}) {
  if (!session) {
    return (
      <Card>
        <CardContent className="p-5 text-base text-[var(--muted)]">
          Le prochain mivhan n’est pas encore programmé.
        </CardContent>
      </Card>
    );
  }

  if (alreadyRegistered) {
    return (
      <Button asChild size="lg" variant="secondary">
        <Link href="/client">
          <CheckCircle2 />
          Tu es déjà inscrit au prochain mivhan le {session.dateLabel}
          {session.location ? ` à ${session.location}` : ""}
        </Link>
      </Button>
    );
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
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
          <Dialog>
            <DialogTrigger render={<Button disabled={session.disabled} />}>
              <Send />
              Je m’inscris au mivhan
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
            >
              <DialogHeader className="shrink-0 grid grid-cols-[1fr_auto] items-start gap-3 border-b border-[var(--border)] bg-popover p-4">
                <div className="grid gap-2">
                  <DialogTitle>{session.title}</DialogTitle>
                  <DialogDescription>
                    Mivhan du {session.dateLabel}
                    {session.location ? ` a ${session.location}` : ""}.
                  </DialogDescription>
                </div>
                <DialogClose
                  render={
                    <Button aria-label="Fermer" variant="ghost" size="icon-sm" />
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
    </div>
  );
}
