"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteNavActions() {
  const pathname = usePathname();
  const isBahourActive =
    pathname === "/client" || pathname.startsWith("/client/");
  const isRequestActive =
    pathname === "/services" ||
    pathname.startsWith("/services/") ||
    pathname.startsWith("/demandes/");

  return (
    <div className="nav-actions">
      <Button
        asChild
        variant="secondary"
        className={cn(
          isBahourActive &&
            "!bg-[var(--primary)] !text-white hover:!bg-[var(--primary)]"
        )}
      >
        <Link href="/client">Espace Bahour</Link>
      </Button>
      <Button
        asChild
        className={cn(
          "!text-white",
          isRequestActive &&
            "!bg-[var(--accent)] !text-[var(--primary)] hover:!bg-[var(--accent)]"
        )}
      >
        <Link href="/services">Faire une demande</Link>
      </Button>
    </div>
  );
}
