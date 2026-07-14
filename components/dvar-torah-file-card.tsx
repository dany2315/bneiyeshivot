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
    toast.success("Lien copie.");
  }

  return (
    <Card className="group border-[var(--border)] bg-white shadow-sm transition hover:border-[rgba(242,99,0,0.28)] hover:shadow-lg">
      <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex min-w-0 gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--primary-soft)] text-[var(--primary)]">
            <FileText className="size-6" />
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={category === "Chabbat" ? "info" : "warning"}>
                {category}
              </Badge>
              <span className="text-sm font-semibold text-[var(--muted)]">
                {date}
              </span>
            </div>
            <CardTitle className="truncate text-xl leading-tight">
              {title}
            </CardTitle>
            <p className="mt-2 line-clamp-2 text-base leading-6 text-[var(--muted)]">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={href} target="_blank">
              <ExternalLink className="size-4" />
              Ouvrir
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href={href} download>
              <Download className="size-4" />
              Telecharger
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
