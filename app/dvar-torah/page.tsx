import { BookOpenText } from "lucide-react";
import { PageShell } from "../components";
import { DvarTorahLibrary } from "@/components/dvar-torah-library";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Dvar Torah",
};

const demoFiles = [
  {
    title: "Chabbat Berechit",
    category: "Chabbat" as const,
    description:
      "Un feuillet clair pour ouvrir l'annee avec des idees courtes, partageables et faciles a transmettre a table.",
    slug: "chabbat-berechit",
    date: "Chabbat",
  },
  {
    title: "Hanouka - La lumiere qui reste",
    category: "Fete" as const,
    description:
      "Un support de lecture pour Hanouka avec points de reflexion, messages courts et questions pour animer l'echange.",
    slug: "hanouka-lumiere",
    date: "Fete",
  },
  {
    title: "Pessah - Sortir avec clarte",
    category: "Fete" as const,
    description:
      "Un feuillet pour preparer Pessah, mettre en avant le sens de la liberte et accompagner les jeunes dans la lecture.",
    slug: "pessah-liberte",
    date: "Fete",
  },
];

export default async function DvarTorahPage() {
  const dbFiles = await prisma.dvarTorahFile.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
  const files =
    dbFiles.length > 0
      ? dbFiles.map((file) => ({
          title: file.title,
          category: file.category === "CHABBAT" ? ("Chabbat" as const) : ("Fete" as const),
          description:
            file.description ||
            "Feuillet Bnei Yeshivot a ouvrir, telecharger ou partager.",
          slug: file.slug,
          date: file.createdAt.toLocaleDateString("fr-FR"),
        }))
      : demoFiles;

  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Dvar Torah</span>
            <h1>Feuillets a telecharger, ouvrir ou partager</h1>
            <p>
              Retrouvez les feuillets mis a disposition par Bnei Yeshivot pour
              les Chabbatot et les fetes. Les prochains fichiers seront ajoutes
              depuis l'interface admin.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-8">
            <Card className="border-[var(--border)] bg-white shadow-sm">
              <CardHeader>
                <BookOpenText className="size-8 text-[var(--accent)]" />
                <CardTitle>Bibliotheque Torah</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="text-base leading-7 text-[var(--muted)]">
                  Filtrez rapidement les feuillets par categorie, puis ouvrez,
                  telechargez ou partagez le fichier souhaite.
                </p>
              </CardContent>
            </Card>

            <DvarTorahLibrary files={files} />
          </div>
        </section>
      </main>
    </PageShell>
  );
}
