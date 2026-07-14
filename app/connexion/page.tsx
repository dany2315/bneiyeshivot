import Link from "next/link";
import { PageShell } from "../components";
import { OtpLoginCard } from "@/components/otp-login-card";
import { Button } from "@/components/ui/button";
import { redirectAuthenticatedBahour } from "@/lib/session";

export const metadata = {
  title: "Connexion",
};

export default async function LoginPage() {
  await redirectAuthenticatedBahour();

  return (
    <PageShell>
      <main>
        <section className="page-hero !py-10 md:!py-[82px]">
          <div className="container">
            <span className="eyebrow">Espace Bahour</span>
            <h1>Connexion</h1>
            <p>
              Accede a ton suivi avec un code temporaire envoye par email. La
              session reste active pendant 30 jours.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container grid max-w-3xl gap-5">
            <OtpLoginCard audience="bahour" redirectTo="/client" />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white/90 p-5">
              <div>
                <h2 className="text-xl font-bold text-[var(--primary)]">
                  Pas encore inscrit ?
                </h2>
                <p className="text-base text-[var(--muted)]">
                  Cree ton acces avec nom, prenom, email et telephone.
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link href="/inscription">S&apos;enregistrer</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
