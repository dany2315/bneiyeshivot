import { PageShell } from "../components";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Faire un don",
};

export default function DonationsPage() {
  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Soutenir Bnei Yeshivot</span>
            <h1>Faire un don</h1>
            <p>
              Paiement sans connexion, rattachement automatique au profil par
              email, Stripe pour les dons principaux et Nedarim Plus prevu pour
              les paiements en shekel.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container grid grid-3">
            {["50 EUR", "100 EUR", "180 EUR", "360 EUR", "Montant libre"].map(
              (amount) => (
                <Card key={amount}>
                  <CardHeader>
                    <span className="icon-box">DON</span>
                    <CardTitle>{amount}</CardTitle>
                    <CardDescription>
                      Don ponctuel ou mensuel, avec recu si eligible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button>Choisir</Button>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
