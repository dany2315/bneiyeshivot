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
  title: "Demande Koupat Holim",
};

export default async function KoupatHolimRequestPage() {
  const user = await getCurrentUser();

  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Koupat Holim</span>
            <h1>Demande Koupat Holim</h1>
            <p>
              Formulaire dédié pour l’accompagnement Koupat Holim :
              informations personnelles, passeport non israélien, formulaire
              rempli et certificat étudiant ou Massa.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container request-layout">
            <RequestStepForm initialUser={user} type="koupat" />
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Suivi Koupat Holim</CardTitle>
                  <CardDescription>
                    Après dépôt, le Bahour pourra suivre le statut de la demande
                    et ajouter les pièces demandées depuis son espace.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Besoin d’un visa ?</CardTitle>
                  <CardDescription>
                    La demande visa étudiant a sa propre page séparée.
                  </CardDescription>
                  <Button asChild variant="secondary">
                    <Link href="/demandes/visa">Aller au visa étudiant</Link>
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
