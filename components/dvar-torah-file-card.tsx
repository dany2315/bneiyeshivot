"use client";

import Link from "next/link";
import { Download, ExternalLink, FileText, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
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
    <Card className="group overflow-hidden border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="grid grid-cols-[112px_1fr] gap-0 sm:grid-cols-[150px_1fr]">
        <div className="relative grid min-h-52 place-items-center bg-[linear-gradient(160deg,var(--primary),#0b385f)] p-4 text-white">
          <div className="absolute inset-x-5 top-5 h-1 rounded-full bg-[var(--accent)]" />
          <div className="grid gap-3 text-center">
            <FileText className="mx-auto size-10 text-[var(--accent)]" />
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/72">
              PDF
            </span>
            <span className="text-sm font-bold leading-5">{category}</span>
          </div>
        </div>
        <div className="grid min-w-0 gap-4 p-5">
          <CardHeader className="p-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={category === "Chabbat" ? "info" : "warning"}>
                {category}
              </Badge>
              <span className="text-sm font-semibold text-[var(--muted)]">
                {date}
              </span>
            </div>
            <CardTitle className="text-2xl leading-tight">{title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-0">
            <p className="text-base leading-7 text-[var(--muted)]">
              {description}
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button asChild variant="ghost">
                <Link href={href} target="_blank">
                  <ExternalLink className="size-4" />
                  Ouvrir
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <a href={href} download>
                  <Download className="size-4" />
                  Telecharger
                </a>
              </Button>
              <Button type="button" variant="accent" onClick={shareFile}>
                <Share2 className="size-4" />
                Partager
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
