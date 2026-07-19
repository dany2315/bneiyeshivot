import { PageShell } from "../components";
import { DvarTorahLibrary } from "@/components/dvar-torah-library";
import { prisma } from "@/lib/prisma";

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
        <section className="page-hero page-hero-compact">
          <div className="container">
            <span className="eyebrow">Dvar Torah</span>
            <h1>Feuillets a telecharger, ouvrir ou partager</h1>
            <p className="max-w-2xl">
              Retrouvez les feuillets mis a disposition par Bnei Yeshivot pour
              les Chabbatot et les fetes.
            </p>
          </div>
        </section>

        <section className="section pt-6">
          <div className="container">
            <DvarTorahLibrary files={files} />
          </div>
        </section>
      </main>
    </PageShell>
  );
}
