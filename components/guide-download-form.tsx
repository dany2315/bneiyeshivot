"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthSession } from "@/components/auth-session";
import { PhoneInputGroup } from "@/components/phone-input-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "guide-bnei-yeshivot.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function GuideDownloadForm() {
  const { user, loading } = useAuthSession();
  const [submitting, setSubmitting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    async function downloadForConnectedUser() {
      if (loading || !user || downloaded) {
        return;
      }

      setDownloaded(true);
      const response = await fetch("/api/guide/download");

      if (!response.ok) {
        toast.error("Impossible de télécharger le guide pour le moment.");
        return;
      }

      downloadBlob(await response.blob());
      toast.success("Guide téléchargé.");
    }

    downloadForConnectedUser();
  }, [downloaded, loading, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const response = await fetch("/api/guide/download", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });

    setSubmitting(false);

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      toast.error(result?.message ?? "Impossible de télécharger le guide.");
      return;
    }

    downloadBlob(await response.blob());
    toast.success("Guide téléchargé.");
  }

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-3xl border border-[var(--border)] bg-white">
        <Loader2 className="size-6 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="grid gap-4 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[var(--primary)]">
            Téléchargement en cours
          </h2>
          <p className="mt-2 text-base leading-7 text-[var(--muted)]">
            Vous êtes connecté avec {user.email}. Le guide se télécharge
            automatiquement.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setDownloaded(false);
          }}
        >
          <Download className="size-4" />
          Relancer le téléchargement
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-5 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-2xl font-bold text-[var(--primary)]">
          Recevoir le guide
        </h2>
        <p className="mt-2 text-base leading-7 text-[var(--muted)]">
          Renseignez vos informations. Si votre email existe déjà, le guide se
          télécharge directement. Sinon, un accès Bahour sera préparé avec ces
          informations.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="guide-first-name">Prénom</Label>
          <Input id="guide-first-name" name="firstName" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="guide-last-name">Nom</Label>
          <Input id="guide-last-name" name="lastName" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="guide-email">Email</Label>
          <Input id="guide-email" name="email" type="email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="guide-phone">Numéro de téléphone</Label>
          <PhoneInputGroup id="guide-phone" name="phone" required />
        </div>
      </div>
      <Button type="submit" variant="accent" size="lg" disabled={submitting}>
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        Télécharger le guide
      </Button>
    </form>
  );
}
