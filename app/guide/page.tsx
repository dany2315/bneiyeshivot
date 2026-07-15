import { BookOpenCheck, CheckCircle2 } from "lucide-react";
import { PageShell } from "../components";
import { GuideDownloadForm } from "@/components/guide-download-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Guide PDF",
};

export default function GuidePage() {
  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Guide PDF</span>
            <h1>Tout preparer avant de venir etudier en Israel</h1>
            <p>
              Un guide pratique pour retrouver les premiers reperes :
              administratif, assurance, visa, installation et contacts utiles.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="h-fit border-[var(--border)] bg-[var(--primary)] text-white">
              <CardHeader>
                <BookOpenCheck className="size-8 text-[var(--accent)]" />
                <CardTitle className="text-3xl text-white">
                  Ce que vous trouverez dans le guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3 text-base leading-7 text-white/82">
                  {[
                    "Documents a preparer avant l'arrivee.",
                    "Demarches visa et assurance maladie.",
                    "Checklist installation : telephone, banque, transport.",
                    "Contacts utiles et premiers reflexes.",
                  ].map((item) => (
                    <li className="flex gap-3" key={item}>
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-[var(--accent)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <GuideDownloadForm />
          </div>
        </section>
      </main>
    </PageShell>
  );
}
