"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { HeaderAccountMenu } from "@/components/header-account-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isAdminUser, useAuthSession } from "@/components/auth-session";
import { cn } from "@/lib/utils";

const phoneNumbers = [
  { label: "France", number: "+33767967148", display: "+33 7 67 96 71 48" },
  { label: "Israel", number: "+972534727103", display: "+972 53 472 7103" },
];

export function SiteNavActions() {
  const pathname = usePathname();
  const { user } = useAuthSession();
  const bahourUser = user && !isAdminUser(user) ? user : null;
  const isBahourActive =
    pathname === "/client" || pathname.startsWith("/client/");

  return (
    <div className="nav-actions">
      {bahourUser ? (
        <HeaderAccountMenu user={bahourUser} />
      ) : (
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
      )}
      <Dialog>
        <DialogTrigger
          render={
            <Button className="!text-white" aria-label="Appeler Bnei Yeshivot">
              <Phone className="size-4" aria-hidden="true" />
              Appeler
            </Button>
          }
        />
        <DialogContent className="phone-dialog-content">
          <DialogHeader>
            <DialogTitle>Appeler Bnei Yeshivot</DialogTitle>
            <DialogDescription>
              Choisissez le numero que vous souhaitez appeler.
            </DialogDescription>
          </DialogHeader>
          <div className="phone-dialog-list">
            {phoneNumbers.map((phone) => (
              <a className="phone-dialog-link" href={`tel:${phone.number}`} key={phone.number}>
                <Phone className="size-4" aria-hidden="true" />
                <span>
                  <strong>{phone.label}</strong>
                  <small>{phone.display}</small>
                </span>
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
