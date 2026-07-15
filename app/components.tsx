import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/mobile-nav";
import { SiteNavActions } from "@/components/site-nav-actions";
import { SiteNavLinks } from "@/components/site-nav-links";

const whatsappGroupUrl =
  "https://chat.whatsapp.com/EJr8re5PAc6B3hTYuwEp7J?s=cl&p=i&ilr=1";

export function SiteHeader() {
  return (
    <header className="topbar">
      <div className="container nav !w-[min(1440px,calc(100%-32px))] gap-3 xl:gap-5">
        <Link className="brand" href="/">
          <Image
            src="/logo-bnei-mark.png"
            alt="Bnei Yeshivot"
            width={370}
            height={335}
            className="brand-logo"
            priority
          />
          <span className="brand-text">
            <strong>Bnei Yeshivot</strong>
            <small>France - Israel</small>
          </span>
        </Link>
        <SiteNavLinks />
        <SiteNavActions />
        <MobileNav />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>Bnei Yeshivot</h3>
          <p>
            Accompagnement des jeunes francophones en Israel, avant leur depart
            et pendant leur parcours.
          </p>
        </div>
        <div>
          <h4>Services</h4>
          <Link href="/a-propos">A propos</Link>
          <Link href="/services">Tous les services</Link>
          <Link href="/demandes/visa">Visa etudiant</Link>
          <Link href="/demandes/koupat-holim">Koupat Holim</Link>
          <Link href="/dvar-torah">Dvar Torah</Link>
          <a href="https://israel-entry.piba.gov.il/apply-for-an-eta-il-1">ETA-IL officiel</a>
        </div>
        <div>
          <h4>Plateforme</h4>
          <Link href="/admin">Admin</Link>
          <Link href="/client">Espace Bahour</Link>
          <Link href="/evenements">Evenements</Link>
          <Link href="/programme">Programme</Link>
          <Link href="/guide">Guide PDF</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <a href={whatsappGroupUrl} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4" aria-hidden="true" />
            Groupe WhatsApp
          </a>
          <a href="mailto:contact@bneiyeshivot.com">
            <Mail className="size-4" aria-hidden="true" />
            contact@bneiyeshivot.com
          </a>
          <a href="tel:+33767967148">
            <Phone className="size-4" aria-hidden="true" />
            +33 7 67 96 71 48
          </a>
          <a href="tel:+972534727103">
            <Phone className="size-4" aria-hidden="true" />
            +972 53 472 7103
          </a>
          <span>
            <MapPin className="size-4" aria-hidden="true" />
            17 Rehov Apisga, Bayit Vagan, Jerusalem
          </span>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "gold" | "blue";
}) {
  const variant =
    tone === "gold" ? "warning" : tone === "blue" ? "info" : "success";

  return <Badge variant={variant}>{children}</Badge>;
}
