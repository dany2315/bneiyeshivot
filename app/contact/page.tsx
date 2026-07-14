import { PageShell } from "../components";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Nous contacter</span>
            <h1>Contact</h1>
            <p>
              Les demandes de contact entreront dans l&apos;admin avec statut,
              source, assignation et historique de traitement.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container split">
            <form className="max-w-[760px] rounded-2xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_48px_rgba(6,40,70,0.045)]">
              <h2 className="mb-4 text-2xl font-bold text-[var(--primary)]">
                Envoyer un message
              </h2>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="contact-name">Nom complet</label>
                  <Input id="contact-name" />
                </div>
                <div className="field">
                  <label htmlFor="contact-email">Email</label>
                  <Input id="contact-email" type="email" />
                </div>
                <div className="field full">
                  <label htmlFor="contact-message">Message</label>
                  <Textarea id="contact-message" />
                </div>
                <div className="full">
                  <Button type="button">Envoyer</Button>
                </div>
              </div>
            </form>
            <div className="grid">
              <Card>
                <CardHeader>
                  <CardTitle>WhatsApp</CardTitle>
                  <CardDescription>
                    Contact rapide pour les jeunes et familles.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Email</CardTitle>
                  <CardDescription>
                    Reception et suivi dans le module contact admin.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
