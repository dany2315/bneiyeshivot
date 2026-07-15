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
            <span className="eyebrow">Installation en Israel</span>
            <h1>Boutique literie</h1>
            <p>
              Des packs simples pour preparer l&apos;arrivee en Israel avec le
              necessaire de literie, a commander avant l&apos;installation.
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
