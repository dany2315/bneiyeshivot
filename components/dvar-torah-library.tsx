"use client";

import { useMemo, useState } from "react";
import { BookOpenText, CalendarDays, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DvarTorahFileCard } from "@/components/dvar-torah-file-card";
import { cn } from "@/lib/utils";

export type DvarTorahPublicFile = {
  title: string;
  category: "Chabbat" | "Fete";
  description: string;
  slug: string;
  date: string;
};

const filters: Array<{
  label: string;
  value: "Tous" | "Chabbat" | "Fete";
  icon: typeof BookOpenText;
}> = [
  { label: "Tous", value: "Tous", icon: BookOpenText },
  { label: "Chabbat", value: "Chabbat", icon: CalendarDays },
  { label: "Fêtes", value: "Fete", icon: Sparkles },
];

export function DvarTorahLibrary({
  files,
}: {
  files: DvarTorahPublicFile[];
}) {
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]["value"]>("Tous");
  const filteredFiles = useMemo(() => {
    if (activeFilter === "Tous") {
      return files;
    }

    return files.filter((file) => file.category === activeFilter);
  }, [activeFilter, files]);

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-[var(--border)] bg-white p-1.5 shadow-sm">
        <div className="grid gap-1.5 sm:grid-cols-3">
          {filters.map(({ label, value, icon: Icon }) => {
            const active = activeFilter === value;

            return (
              <Button
                key={value}
                type="button"
                variant={active ? "default" : "ghost"}
                className={cn(
                  "h-9 justify-start rounded-md px-3 text-sm",
                  active
                    ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]"
                    : "text-[var(--primary)] hover:bg-[var(--primary-soft)]"
                )}
                onClick={() => setActiveFilter(value)}
              >
                <Icon className="size-4" />
                {label}
                <span
                  className={cn(
                    "ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold",
                    active
                      ? "bg-white/16 text-white"
                      : "bg-[var(--primary-soft)] text-[var(--primary)]"
                  )}
                >
                  {value === "Tous"
                    ? files.length
                    : files.filter((file) => file.category === value).length}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3">
        {filteredFiles.map((file) => (
          <DvarTorahFileCard key={file.slug} {...file} />
        ))}
      </div>
    </div>
  );
}
