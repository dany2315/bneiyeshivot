import Link from "next/link";
import { DvarTorahCategory } from "@prisma/client";
import { BookOpenText, Download, Eye, FileText, Trash2, Upload } from "lucide-react";
import { AdminShell } from "@/components/admin-sidebar";
import { AdminFileInput } from "@/components/admin-file-input";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  createDvarTorahFile,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
  title: "Admin Dvar Torah",
};

const categoryLabels: Record<DvarTorahCategory, string> = {
  CHABBAT: "Chabbat",
  FETE: "Fete",
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
          <span className="eyebrow">Bibliotheque Torah</span>
          <h1>Dvar Torah</h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="h-fit border-[var(--border)] bg-white shadow-sm">
          <CardHeader>
            <BookOpenText className="size-8 text-[var(--accent)]" />
            <CardTitle>Ajouter un feuillet</CardTitle>
            <CardDescription>
              Uploadez un PDF, choisissez sa categorie et publiez-le dans la
              page Dvar Torah.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createDvarTorahFile} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="dvar-title">Nom du feuillet</Label>
                <Input
                  id="dvar-title"
                  name="title"
                  placeholder="Ex: Chabbat Berechit"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dvar-category">Categorie</Label>
                <NativeSelect
                  id="dvar-category"
                  name="category"
                  className="w-full"
                  required
                >
                  <NativeSelectOption value={DvarTorahCategory.CHABBAT}>
                    Chabbat
                  </NativeSelectOption>
                  <NativeSelectOption value={DvarTorahCategory.FETE}>
                    Fete
                  </NativeSelectOption>
                </NativeSelect>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dvar-description">Description</Label>
                <Textarea
                  id="dvar-description"
                  name="description"
                  placeholder="Court texte affiché sur la carte publique."
                />
              </div>

              <div className="grid gap-2">
                <Label>Fichier PDF</Label>
                <AdminFileInput
                  accept="application/pdf"
                  description="PDF uniquement."
                  name="file"
                  required
                  title="Choisir le PDF"
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--subtle)] p-3 text-base font-semibold text-[var(--primary)]">
                <input
                  name="published"
                  type="checkbox"
                  defaultChecked
                  className="size-4 accent-[var(--accent)]"
                />
                Publier directement sur le site
              </label>

              <Button type="submit" variant="accent" size="lg">
                <Upload className="size-4" />
                Ajouter le feuillet
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid self-start gap-4 xl:-mt-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-[var(--primary)]">
                Feuillets publies et brouillons
              </h2>
              <p className="text-base text-[var(--muted)]">
                {files.length} fichier(s) dans la bibliotheque.
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
                      <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
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
                            {file.published ? "Publi?" : "Brouillon"}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-base leading-7 text-[var(--muted)]">
                          {file.description || "Aucune description."}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                          {formatSize(file.size)} - ajoute le{" "}
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
                        <a href={fileHref} download>
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
                          {file.published ? "Mettre en brouillon" : "Publi?r"}
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
      </div>
    </AdminShell>
  );
}
