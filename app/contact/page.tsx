import { PageShell } from "../components";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
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

const whatsappGroupUrl =
  "https://chat.whatsapp.com/EJr8re5PAc6B3hTYuwEp7J?s=cl&p=i&ilr=1";

export default function ContactPage() {
  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Nous contacter</span>
            <h1>Contact</h1>
            <p>
              Une question, une demande d&apos;accompagnement ou un besoin pratique ?
              Notre equipe vous repond en France comme en Israel.
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
            <div className="grid contact-info-grid">
              <Card>
                <CardHeader>
                  <CardTitle className="contact-card-title">
                    <MessageCircle className="size-5" aria-hidden="true" />
                    WhatsApp
                  </CardTitle>
                  <CardDescription className="space-y-3">
                    <span>
                      Recevez les annonces et les prochaines activites de
                      l&apos;association.
                    </span>
                    <Button asChild className="h-auto w-full justify-between rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-[var(--primary)] shadow-sm transition hover:border-[rgba(242,99,0,0.32)] hover:bg-[var(--subtle)]">
                      <a
                        href={whatsappGroupUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Rejoindre le groupe WhatsApp"
                      >
                        <span className="flex items-center gap-3">
                          <span className="grid size-9 place-items-center rounded-md bg-[var(--primary-soft)] text-[var(--primary)]">
                            <MessageCircle
                              className="size-5"
                              aria-hidden="true"
                            />
                          </span>
                          <span className="text-left">
                            <span className="block font-bold">Rejoindre le groupe</span>
                            <span className="block text-xs font-medium text-[var(--muted)]">
                              Annonces et activites
                            </span>
                          </span>
                        </span>
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </a>
                    </Button>
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="contact-card-title">
                    <Mail className="size-5" aria-hidden="true" />
                    Email
                  </CardTitle>
                  <CardDescription>
                    <a href="mailto:contact@bneiyeshivot.com">
                      contact@bneiyeshivot.com
                    </a>
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="contact-card-title">
                    <Phone className="size-5" aria-hidden="true" />
                    Telephone
                  </CardTitle>
                  <CardDescription>
                    <a href="tel:+33767967148">France : +33 7 67 96 71 48</a>
                    <a href="tel:+972534727103">Israel : +972 53 472 7103</a>
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="contact-card-title">
                    <MapPin className="size-5" aria-hidden="true" />
                    Adresse
                  </CardTitle>
                  <CardDescription>
                    17 Rehov Apisga, Bayit Vagan, Jerusalem
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
