import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/mobile-nav";
import { SiteNavActions } from "@/components/site-nav-actions";
import { SiteNavLinks } from "@/components/site-nav-links";

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
          <Link href="/venir-etudier">Je viens etudier en Israel</Link>
          <Link href="/a-propos">A propos</Link>
          <Link href="/services">Tous les services</Link>
          <Link href="/demandes/visa">Visa etudiant</Link>
          <Link href="/demandes/koupat-holim">Koupat Holim</Link>
          <Link href="/dvar-torah">Dvar Torah</Link>
          <a href="https://israel-entry.piba.gov.il/">ETA-IL officiel</a>
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
          <span>WhatsApp</span>
          <span>Email</span>
          <span>Jerusalem / France</span>
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
