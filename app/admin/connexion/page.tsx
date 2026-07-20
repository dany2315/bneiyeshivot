import { PageShell } from "../../components";
import { OtpLoginCard } from "@/components/otp-login-card";
import { redirectAuthenticatedAdmin } from "@/lib/session";

export const metadata = {
  title: "Connexion admin",
};

export default async function AdminLoginPage() {
  await redirectAuthenticatedAdmin();

  return (
    <PageShell>
      <main>
        <section className="page-hero !py-10 md:!py-[82px]">
          <div className="container">
            <span className="eyebrow">Back-office</span>
            <h1>Connexion admin</h1>
            <p>
              Accès réservé aux comptes administrateurs autorisés. Aucun
              enregistrement public n’est disponible pour l’admin.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container max-w-3xl">
            <OtpLoginCard
              audience="admin"
              description="Entre ton email admin pour recevoir un code temporaire."
              redirectTo="/admin"
              title="Connexion administrateur"
            />
          </div>
        </section>
      </main>
    </PageShell>
  );
}
