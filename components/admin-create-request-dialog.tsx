"use client";

import { ClipboardPlus, XIcon } from "lucide-react";
import { RequestStepForm } from "@/components/request-step-form";
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

export function AdminCreateRequestDialog({
  type,
}: {
  type: "visa" | "koupat";
}) {
  const title = type === "visa" ? "Creer une demande visa" : "Creer une demande koupat holim";

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button>
            <ClipboardPlus className="size-4" />
            Nouvelle demande
          </Button>
        }
      />
      <DialogContent
        showCloseButton={false}
        className="max-h-[92vh] w-fit max-w-[calc(100vw-2rem)] overflow-hidden p-0 sm:max-w-fit"
      >
        <DialogHeader className="sticky top-0 z-20 grid grid-cols-[1fr_auto] items-start gap-3 border-b border-[var(--border)] bg-popover p-4">
          <div className="grid gap-2">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Remplissez le dossier pour un Bahour depuis l&apos;interface admin.
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
        <div className="max-h-[calc(92vh-96px)] overflow-y-auto p-4">
          <RequestStepForm adminMode type={type} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
