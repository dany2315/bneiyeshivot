"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Mail } from "lucide-react";
import { toast } from "sonner";
import { signOutRequest } from "@/components/auth-sign-out";
import {
  getUserDisplayName,
  getUserInitials,
  type ClientSessionUser,
} from "@/components/auth-session";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderAccountMenuProps = {
  user: ClientSessionUser;
};

export function HeaderAccountMenu({ user }: HeaderAccountMenuProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const displayName = getUserDisplayName(user);

  async function signOut() {
    setLoading(true);

    const response = await signOutRequest();

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
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-[var(--border)] bg-white shadow-sm transition hover:bg-[var(--primary-soft)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Ouvrir le compte connecte"
          />
        }
      >
        <Avatar className="size-9 border border-[var(--border)] bg-[var(--primary-soft)]">
          <AvatarFallback className="bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]">
            {getUserInitials(user)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-xl"
      >
        <DropdownMenuLabel className="px-3 py-3">
          <span className="block text-base font-bold text-[var(--primary)]">
            {displayName || "Compte Bahour"}
          </span>
          <span className="mt-1 flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
            <Mail className="size-3.5" />
            {user.email}
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
          {loading ? "Deconnexion..." : "Se deconnecter"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
