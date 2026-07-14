import Link from "next/link";
import { PageShell } from "../../components";
import { RequestStepForm } from "@/components/request-step-form";
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

export default function KoupatHolimRequestPage() {
  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Koupat Holim</span>
            <h1>Demande koupat holim</h1>
            <p>
              Formulaire dedie pour l&apos;accompagnement koupat holim :
              informations personnelles, passeport non israelien, formulaire
              rempli et certificat etudiant ou Massa.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container request-layout">
            <RequestStepForm type="koupat" />
            <div>
              <Card>
                <CardHeader>
                  <span className="icon-box">KHP</span>
                  <CardTitle>Suivi koupat holim</CardTitle>
                  <CardDescription>
                    Apres depot, le Bahour pourra suivre le statut de la demande
                    et ajouter les pieces demandees depuis son espace.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="mt-4">
                <CardHeader>
                  <span className="icon-box">AUTRE</span>
                  <CardTitle>Besoin d&apos;un visa ?</CardTitle>
                  <CardDescription>
                    La demande visa etudiant a sa propre page separee.
                  </CardDescription>
                  <Button asChild variant="secondary">
                    <Link href="/demandes/visa">Aller au visa etudiant</Link>
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
