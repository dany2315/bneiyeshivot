import Link from "next/link";
import { PageShell } from "../../components";
import { RequestStepForm } from "@/components/request-step-form";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Demande visa étudiant",
};

export default async function VisaRequestPage() {
  const user = await getCurrentUser();

  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Visa étudiant</span>
            <h1>Demande visa</h1>
            <p>
              Formulaire dedie pour deposer une demande de visa etudiant avec
              passeport non israelien, statut yeshiva ou Massa et pieces
              justificatives.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container request-layout">
            <RequestStepForm initialUser={user} type="visa" />
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Suivi du dossier</CardTitle>
                  <CardDescription>
                    Apres depot, le Bahour pourra suivre le statut, ajouter des
                    documents et lire les messages de l&apos;équipe.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Besoin d&apos;un autre service ?</CardTitle>
                  <CardDescription>
                    La demande koupat holim a sa propre page separee.
                  </CardDescription>
                  <Button asChild variant="secondary">
                    <Link href="/demandes/koupat-holim">
                      Aller a Koupat Holim
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
