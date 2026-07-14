import { PageShell } from "../components";
import { events } from "../data";
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
  title: "Evenements",
};

export default function EventsPage() {
  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Vie communautaire</span>
            <h1>Evenements</h1>
            <p>
              L&apos;admin pourra creer les evenements futurs et passes, ajouter du
              texte riche, une image, une date, un lieu, une capacite et suivre
              les demandes de participation.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container grid grid-3">
            {events.map((event) => (
              <Card key={event.title}>
                <CardHeader>
                  <Badge variant="info">EVT</Badge>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <p>
                    <strong>
                      {event.date} - {event.location}
                    </strong>
                  </p>
                  <Button>S&apos;inscrire</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
