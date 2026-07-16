"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  CircleHelp,
  Gift,
  House,
  LogOut,
  Mail,
  Menu,
  BookOpenText,
  ShoppingBag,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { signOutRequest } from "@/components/auth-sign-out";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getUserDisplayName,
  getUserInitials,
  isAdminUser,
  useAuthSession,
} from "@/components/auth-session";
import { cn } from "@/lib/utils";

const navLinks: Array<[string, string, LucideIcon]> = [
  ["Accueil", "/", House],
  ["A propos", "/a-propos", CircleHelp],
  ["Services", "/services", Sparkles],
  ["Evenements", "/evenements", CalendarDays],
  ["Programme", "/programme", Trophy],
  ["Dvar Torah", "/dvar-torah", BookOpenText],
  ["Boutique", "/boutique", ShoppingBag],
  ["Faire un don", "/dons", Gift],
  ["Contact", "/contact", Mail],
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const { user } = useAuthSession();
  const bahourUser = user && !isAdminUser(user) ? user : null;
  const displayName = getUserDisplayName(bahourUser);

  async function signOut() {
    setSigningOut(true);

    try {
      await signOutRequest();
    } catch {
      setSigningOut(false);
      toast.error("Impossible de se deconnecter pour le moment.");
      return;
    }

    toast.success("Vous etes deconnecte.");
    router.push("/connexion");
    router.refresh();
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="secondary"
            size="icon"
            className="mobile-menu-button"
            aria-label="Ouvrir le menu"
          />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(92vw,390px)] max-w-none gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="mobile-sheet-header">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-bnei-mark.png"
              alt="Bnei Yeshivot"
              width={370}
              height={335}
              className="brand-logo"
            />
            <div>
              <SheetTitle className="text-xl font-bold text-[var(--primary)]">
                Bnei Yeshivot
              </SheetTitle>
              <SheetDescription>France - Israel</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <ScrollArea className="mobile-nav-scroll">
          <nav className="mobile-nav-list" aria-label="Navigation mobile">
            {navLinks.map(([label, href, Icon]) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(`${href}/`);

              return (
                <SheetClose
                  render={
                    <Link
                      href={href as string}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-2xl transition",
                        active &&
                          "!bg-[var(--primary-soft)] !text-[var(--primary)] shadow-sm"
                      )}
                    />
                  }
                  key={label}
                >
                  <Icon className="size-5" />
                  <span>{label}</span>
                </SheetClose>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="mobile-nav-actions">
          {bahourUser ? (
            <div className="grid gap-3">
              <div className="rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-10 border border-[var(--border)] bg-[var(--primary-soft)]">
                    <AvatarFallback className="bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary)]">
                      {getUserInitials(bahourUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--primary)]">
                      {displayName || "Compte Bahour"}
                    </p>
                    <p className="truncate text-xs font-semibold text-[var(--muted)]">
                      {bahourUser.email}
                    </p>
                  </div>
                </div>
              </div>
              <SheetClose
                render={
                  <Link
                    href="/client"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--primary)] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--primary-strong)]"
                  />
                }
              >
                Mon espace
              </SheetClose>
              <Button
                type="button"
                variant="secondary"
                className="min-h-12 w-full rounded-full border border-[var(--border)] bg-white text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary-soft)]"
                disabled={signingOut}
                onClick={signOut}
              >
                <LogOut className="size-4" />
                {signingOut ? "Deconnexion..." : "Se deconnecter"}
              </Button>
            </div>
          ) : (
            <>
              <div className="mobile-nav-help">
                <strong>Besoin d&apos;aide ?</strong>
                <span>
                  Demandes, documents, dons et recus depuis votre espace.
                </span>
              </div>
              <SheetClose
                render={
                  <Link
                    href="/connexion"
                    aria-current={
                      pathname === "/client" || pathname.startsWith("/client/")
                        ? "page"
                        : undefined
                    }
                    className={cn(
                      "inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 text-sm font-bold text-[var(--primary)] shadow-sm transition hover:bg-[var(--primary-soft)]",
                      (pathname === "/client" ||
                        pathname.startsWith("/client/")) &&
                        "!bg-[var(--primary)] !text-white hover:!bg-[var(--primary)]"
                    )}
                  />
                }
              >
                Mon espace
              </SheetClose>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
