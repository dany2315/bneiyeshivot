"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  ["Accueil", "/"],
  ["Venir en Israel", "/venir-etudier"],
  ["A propos", "/a-propos"],
  ["Services", "/services"],
  ["Evenements", "/evenements"],
  ["Programme", "/programme"],
  ["Dvar Torah", "/dvar-torah"],
  ["Boutique", "/boutique"],
  ["Faire un don", "/dons"],
  ["Contact", "/contact"],
] as const;

function isActivePath(pathname: string, href: string) {
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

        return (
          <Link
            key={href}
            href={href}
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
