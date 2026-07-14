"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, LayoutDashboard, LogOut, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  getUserDisplayName,
  getUserInitials,
  type ClientSessionUser,
} from "@/components/auth-session";
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

type HeaderAccountMenuProps = {
  user: ClientSessionUser;
};

export function HeaderAccountMenu({ user }: HeaderAccountMenuProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const displayName = getUserDisplayName(user);

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
            className="h-12 gap-2 rounded-full border border-[var(--border)] bg-white px-2 pr-4 shadow-sm hover:bg-[var(--primary-soft)]"
            aria-label="Ouvrir le compte connecte"
          />
        }
      >
        <Avatar className="size-9 border border-[var(--border)] bg-[var(--primary-soft)]">
          <AvatarFallback className="bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]">
            {getUserInitials(user)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden min-w-0 text-left xl:block">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)]">
            <CheckCircle2 className="size-3.5 text-[var(--success)]" />
            Connecte
          </span>
          <span className="block max-w-[120px] truncate text-xs font-semibold text-[var(--muted)]">
            {displayName || user.email}
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-xl"
      >
        <DropdownMenuLabel className="px-3 py-2">
          <span className="block text-sm font-bold text-[var(--primary)]">
            {displayName || "Compte Bahour"}
          </span>
          <span className="mt-1 flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
            <Mail className="size-3.5" />
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href="/client" />}
          className="gap-2 px-3 py-2 text-sm font-semibold text-[var(--primary)]"
        >
          <LayoutDashboard className="size-4" />
          Ouvrir mon Espace Bahour
        </DropdownMenuItem>
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
