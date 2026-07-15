"use client";

import Link from "next/link";
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
import { CalendarDays, CheckCircle2, MapPin, Send } from "lucide-react";

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
          Le prochain mivhan n&apos;est pas encore programme.
        </CardContent>
      </Card>
    );
  }

  if (alreadyRegistered) {
    return (
      <Button asChild size="lg" variant="secondary">
        <Link href="/client">
          <CheckCircle2 />
          Tu es deja inscrit au prochain mivhan le {session.dateLabel}
          {session.location ? ` a ${session.location}` : ""}
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
              Je m&apos;inscris au mivhan
            </DialogTrigger>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>{session.title}</DialogTitle>
                <DialogDescription>
                  Mivhan du {session.dateLabel}
                  {session.location ? ` a ${session.location}` : ""}.
                </DialogDescription>
              </DialogHeader>
              <TalmoudoRegistrationForm
                compact
                initialUser={initialUser}
                sessions={[session]}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
