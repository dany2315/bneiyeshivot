"use client";

import { ClipboardPlus } from "lucide-react";
import { RequestStepForm } from "@/components/request-step-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
  const title = type === "visa" ? "Créer une demande visa" : "Créer une demande koupat holim";

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
      <DialogContent className="max-h-[92vh] w-fit max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-fit">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Remplissez le dossier pour un Bahour depuis l&apos;interface admin.
          </DialogDescription>
        </DialogHeader>
        <RequestStepForm type={type} />
      </DialogContent>
    </Dialog>
  );
}
