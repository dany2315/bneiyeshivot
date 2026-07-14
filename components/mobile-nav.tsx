"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Gift,
  Mail,
  Menu,
  ShoppingBag,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

const navLinks: Array<[string, string, LucideIcon]> = [
  ["Services", "/services", Sparkles],
  ["Evenements", "/evenements", CalendarDays],
  ["Programme", "/programme", Trophy],
  ["Boutique", "/boutique", ShoppingBag],
  ["Faire un don", "/dons", Gift],
  ["Contact", "/contact", Mail],
];

export function MobileNav() {
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
            {navLinks.map(([label, href, Icon]) => (
              <SheetClose render={<Link href={href as string} />} key={label}>
                <Icon className="size-5" />
                <span>{label}</span>
              </SheetClose>
            ))}
          </nav>
        </ScrollArea>

        <div className="mobile-nav-actions ">
          <div className="mobile-nav-help">
            <strong>Besoin d&apos;aide ?</strong>
            <span>Demande, documents, dons et suivi depuis l&apos;Espace Bahour.</span>
          </div>
          <SheetClose
            render={
              <Link
                href="/client"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 text-sm font-bold text-[var(--primary)] shadow-sm transition hover:bg-[var(--primary-soft)]"
              />
            }
          >
            Espace Bahour
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
