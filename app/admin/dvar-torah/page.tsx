import Link from "next/link";
import { DvarTorahCategory } from "@prisma/client";
import { Download, Eye, FileText, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin-sidebar";
import { AdminDvarTorahAddDialog } from "@/components/admin-dvar-torah-add-dialog";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  deleteDvarTorahFile,
  updateDvarTorahPublication,
} from "./actions";
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
  title: "Admin Dvar Torah",
};

const categoryLabels: Record<DvarTorahCategory, string> = {
  CHABBAT: "Chabbat",
  FETE: "Fête",
};

function formatSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} Ko`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} Mo`;
}

export default async function AdminDvarTorahPage() {
  await requireAdminUser();

  const files = await prisma.dvarTorahFile.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell>
      <div className="admin-header">
        <div>
          <span className="eyebrow">Bibliothèque Torah</span>
          <h1>Dvar Torah</h1>
        </div>
        <AdminDvarTorahAddDialog />
      </div>

      <div className="grid self-start gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[var(--primary)]">
              Feuillets publiés et brouillons
            </h2>
            <p className="text-base text-[var(--muted)]">
              {files.length} fichier(s) dans la bibliothèque.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/dvar-torah" target="_blank">
              <Eye className="size-4" />
              Voir la page publique
            </Link>
          </Button>
        </div>

        {files.length === 0 ? (
          <Card className="border-dashed border-[var(--border)] bg-white/80">
            <CardHeader>
              <CardTitle>Aucun feuillet pour le moment</CardTitle>
              <CardDescription>
                Ajoutez un premier PDF pour alimenter la page Dvar Torah.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          files.map((file) => {
            const fileHref = `/api/dvar-torah/${file.slug}/download`;

            return (
              <Card
                key={file.id}
                className="border-[var(--border)] bg-white shadow-sm"
              >
                <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="flex min-w-0 gap-4">
                    <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                      <FileText className="size-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-xl font-bold text-[var(--primary)]">
                          {file.title}
                        </h3>
                        <Badge
                          variant={file.category === "CHABBAT" ? "info" : "warning"}
                        >
                          {categoryLabels[file.category]}
                        </Badge>
                        <Badge variant={file.published ? "success" : "secondary"}>
                          {file.published ? "Publié" : "Brouillon"}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-base leading-7 text-[var(--muted)]">
                        {file.description || "Aucune description."}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                        {formatSize(file.size)} - ajouté le{" "}
                        {file.createdAt.toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button asChild variant="ghost">
                      <Link href={fileHref} target="_blank">
                        <Eye className="size-4" />
                        Ouvrir
                      </Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <a href={`${fileHref}?download=1`} download>
                        <Download className="size-4" />
                        PDF
                      </a>
                    </Button>
                    <form action={updateDvarTorahPublication}>
                      <input type="hidden" name="id" value={file.id} />
                      <input
                        type="hidden"
                        name="published"
                        value={file.published ? "" : "on"}
                      />
                      <Button type="submit" variant="secondary">
                        {file.published ? "Mettre en brouillon" : "Publier"}
                      </Button>
                    </form>
                    <form action={deleteDvarTorahFile}>
                      <input type="hidden" name="id" value={file.id} />
                      <Button type="submit" variant="destructive">
                        <Trash2 className="size-4" />
                        Supprimer
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </AdminShell>
  );
}
