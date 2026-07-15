import { PageShell } from "../components";
import { storePacks } from "../data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Boutique",
};

export default function StorePage() {
  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Installation en Israël</span>
            <h1>Boutique literie</h1>
            <p>
              Premiere base pour vendre des packs d&apos;installation sans
              compte, avec suivi commande dans l&apos;Espace Bahour et gestion
              admin.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container grid grid-3">
            {storePacks.map(([pack, description, price]) => (
              <Card key={pack}>
                <CardHeader>
                  <Badge variant="warning">KIT</Badge>
                  <CardTitle>{pack}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <strong className="text-2xl text-[var(--primary)]">
                    {price}
                  </strong>
                  <Button>Commander</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
