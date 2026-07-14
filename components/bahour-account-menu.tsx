"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LogOut, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BahourAccountMenuProps = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

function getInitials(firstName?: string | null, lastName?: string | null) {
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((value) => value?.charAt(0).toUpperCase())
    .join("");

  return initials || "BY";
}

export function BahourAccountMenu({
  email,
  firstName,
  lastName,
}: BahourAccountMenuProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  async function signOut() {
    setLoading(true);

    const response = await fetch("/api/auth/sign-out", {
      method: "POST",
    });

    if (!response.ok) {
      setLoading(false);
      toast.error("Impossible de se deconnecter pour le moment.");
      return;
    }

    toast.success("Vous etes deconnecte.");
    router.push("/connexion");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="secondary"
            className="h-auto min-h-14 gap-3 rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-left shadow-sm hover:bg-[var(--primary-soft)]"
          />
        }
      >
        <Avatar className="size-10 border border-[var(--border)] bg-[var(--primary-soft)]">
          <AvatarFallback className="bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary)]">
            {getInitials(firstName, lastName)}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--primary)]">
            <CheckCircle2 className="size-4 text-[var(--success)]" />
            Connecte
          </span>
          <span className="block max-w-[190px] truncate text-xs font-semibold text-[var(--muted)]">
            {fullName || email}
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-xl"
      >
        <DropdownMenuLabel className="px-3 py-2">
          <span className="block text-sm font-bold text-[var(--primary)]">
            {fullName || "Compte Bahour"}
          </span>
          <span className="mt-1 flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
            <Mail className="size-3.5" />
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 px-3 py-2 text-sm font-semibold text-[var(--primary)]">
          <UserRound className="size-4" />
          Session active 30 jours
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={loading}
          onClick={signOut}
          variant="destructive"
          className="gap-2 px-3 py-2 text-sm font-bold"
        >
          <LogOut className="size-4" />
          {loading ? "Deconnexion..." : "Se deconnecter"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
