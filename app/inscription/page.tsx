import Link from "next/link";
import { PageShell } from "../components";
import { OtpLoginCard } from "@/components/otp-login-card";
import { Button } from "@/components/ui/button";
import { redirectAuthenticatedBahour } from "@/lib/session";

export const metadata = {
  title: "Inscription",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string }>;
}) {
  await redirectAuthenticatedBahour();
  const params = await searchParams;

  return (
    <PageShell>
      <main>
        <section className="page-hero !py-10 md:!py-[82px]">
          <div className="container">
            <span className="eyebrow">Mon espace</span>
            <h1>Inscription</h1>
            <p>
              Crée ton accès pour suivre tes demandes, documents, inscriptions,
              dons et mivhanim.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container grid max-w-3xl gap-5">
            <OtpLoginCard
              audience="bahour"
              description="Choisis ton type de compte, renseigne tes informations, puis valide le code envoyé par email."
              initialEmail={params.email ?? ""}
              initialMessage={params.error ?? ""}
              mode="register"
              redirectTo="/client"
              title="Créer mon accès"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white/90 p-5">
              <p className="text-base text-[var(--muted)]">
                Tu as déjà un accès ?
              </p>
              <Button asChild variant="secondary">
                <Link href="/connexion">Se connecter</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
