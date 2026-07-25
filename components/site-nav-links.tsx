"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  ["Accueil", "/"],
  ["Israël", "/venir-etudier"],
  ["À propos", "/a-propos"],
  ["Services", "/services"],
  ["Événements", "/evenements"],
  ["Programme", "/programme"],
  ["Dvar Torah", "/dvar-torah"],
  ["Boutique", "/boutique"],
  ["Faire un don", "https://toratyaacov.fr/"],
  ["Contact", "/contact"],
] as const;

function isActivePath(pathname: string, href: string) {
  if (href.startsWith("http")) {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNavLinks() {
  const pathname = usePathname();

  return (
    <nav
      className="nav-links min-w-0 flex-1 justify-center"
      aria-label="Navigation principale"
    >
      {navLinks.map(([label, href]) => {
        const active = isActivePath(pathname, href);
        const isExternal = href.startsWith("http");

        return (
          <Link
            key={href}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full",
              active &&
                "!bg-[var(--primary-soft)] !text-[var(--primary)] shadow-sm"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
