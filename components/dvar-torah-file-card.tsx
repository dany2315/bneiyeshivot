"use client";

import Link from "next/link";
import { Download, ExternalLink, FileText, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";

type DvarTorahFileCardProps = {
  title: string;
  category: "Chabbat" | "Fete";
  description: string;
  slug: string;
  date: string;
};

export function DvarTorahFileCard({
  title,
  category,
  description,
  slug,
  date,
}: DvarTorahFileCardProps) {
  const href = `/api/dvar-torah/${slug}/download`;

  async function shareFile() {
    const url = `${window.location.origin}${href}`;

    if (navigator.share) {
      await navigator.share({
        title,
        text: description,
        url,
      });
      return;
    }

    await navigator.clipboard.writeText(url);
    toast.success("Lien copié.");
  }

  return (
    <Card className="group border-[var(--border)] bg-white shadow-sm transition hover:border-[rgba(242,99,0,0.28)]">
      <CardContent className="grid gap-3 p-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex min-w-0 gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--primary-soft)] text-[var(--primary)]">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Badge variant={category === "Chabbat" ? "info" : "warning"}>
                {category === "Fete" ? "Fête" : category}
              </Badge>
              <span className="text-xs font-semibold text-[var(--muted)]">
                {date}
              </span>
            </div>
            <CardTitle className="truncate text-base leading-tight">
              {title}
            </CardTitle>
            <p className="mt-1 line-clamp-1 text-sm leading-5 text-[var(--muted)]">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-1.5">
          <Button asChild variant="ghost" size="sm">
            <Link href={href} target="_blank">
              <ExternalLink className="size-4" />
              Ouvrir
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href={href} download>
              <Download className="size-4" />
              Télécharger
            </a>
          </Button>
          <Button type="button" variant="accent" size="sm" onClick={shareFile}>
            <Share2 className="size-4" />
            Partager
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
