"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Mail } from "lucide-react";
import { toast } from "sonner";
import { signOutRequest } from "@/components/auth-sign-out";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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

    try {
      await signOutRequest();
    } catch {
      setLoading(false);
      toast.error("Impossible de se déconnecter pour le moment.");
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
          <button
            type="button"
            className="grid size-12 place-items-center rounded-full border border-[var(--border)] bg-white shadow-sm transition hover:bg-[var(--primary-soft)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Ouvrir le compte Bahour"
          />
        }
      >
        <Avatar className="size-10 border border-[var(--border)] bg-[var(--primary-soft)]">
          <AvatarFallback className="bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary)]">
            {getInitials(firstName, lastName)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-xl"
      >
        <DropdownMenuGroup>
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
          <DropdownMenuItem
            onClick={() => router.push("/client")}
            className="gap-2 px-3 py-2 text-sm font-semibold text-[var(--primary)]"
          >
            <LayoutDashboard className="size-4" />
            Mon espace
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={loading}
            onClick={signOut}
            variant="destructive"
            className="gap-2 px-3 py-2 text-sm font-bold"
          >
            <LogOut className="size-4" />
            {loading ? "Déconnexion..." : "Se déconnecter"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
