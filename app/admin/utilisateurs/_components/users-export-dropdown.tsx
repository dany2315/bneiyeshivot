"use client";

import { Download, GraduationCap, School, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const itemClassName =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-[var(--primary)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]";

const exportOptions = [
  {
    href: "/admin/utilisateurs/export",
    icon: Users,
    label: "Tous les bahourim",
  },
  {
    href: "/admin/utilisateurs/export?accountType=BAHOUR",
    icon: GraduationCap,
    label: "Bahour uniquement",
  },
  {
    href: "/admin/utilisateurs/export?accountType=YESHIVA",
    icon: School,
    label: "Yeshiva uniquement",
  },
];

export function UsersExportDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>
        <Download className="size-4" />
        Exporter
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Exporter en Excel</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {exportOptions.map((option) => {
          const Icon = option.icon;

          return (
            <a className={itemClassName} href={option.href} key={option.href}>
              <Icon className="size-4" />
              {option.label}
            </a>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
