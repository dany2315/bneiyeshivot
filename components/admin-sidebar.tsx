"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileCheck,
  Gift,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Settings,
  ShoppingBag,
  Trophy,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type AdminItem = [string, LucideIcon, boolean?];

const adminGroups: Array<{
  label: string;
  items: AdminItem[];
}> = [
  {
    label: "Pilotage",
    items: [
      ["Dashboard", LayoutDashboard, true],
      ["Demandes", Inbox],
      ["Contacts", MessageSquare],
      ["Utilisateurs", Users],
    ],
  },
  {
    label: "Services",
    items: [
      ["Visa etudiant", FileCheck],
      ["Koupat Holim", ClipboardList],
      ["Evenements", CalendarDays],
      ["Talmoudo Beyado", Trophy],
    ],
  },
  {
    label: "Paiements",
    items: [
      ["Boutique", ShoppingBag],
      ["Commandes", CreditCard],
      ["Dons", Gift],
      ["Recus", FileCheck],
    ],
  },
  {
    label: "Systeme",
    items: [["Parametres", Settings]],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="admin-shell">
        <Sidebar className="admin-shadcn-sidebar" collapsible="icon">
          <SidebarHeader className="admin-sidebar-header">
            <Link className="admin-sidebar-brand" href="/">
              <Image
                src="/logo-bnei-cropped.png"
                alt="Bnei Yeshivot"
                width={628}
                height={527}
                className="admin-logo"
              />
            </Link>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/" />} tooltip="Retour au site">
                  <Home />
                  <span>Retour au site</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent className="admin-sidebar-scroll">
            {adminGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupAction aria-label={`Ajouter ${group.label}`}>
                  <ChevronRight />
                </SidebarGroupAction>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map(([label, Icon, active]) => (
                      <SidebarMenuItem key={label}>
                        <SidebarMenuButton
                          isActive={Boolean(active)}
                          tooltip={label}
                        >
                          <Icon />
                          <span>{label}</span>
                        </SidebarMenuButton>
                        <SidebarMenuAction showOnHover aria-label="Actions">
                          <MoreHorizontal />
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter className="admin-sidebar-footer">
            <div className="admin-user-card">
              <Avatar size="lg">
                <AvatarImage src="/logo-bnei-mark.png" alt="Admin" />
                <AvatarFallback>BY</AvatarFallback>
              </Avatar>
              <div className="admin-user-meta">
                <strong>Admin Bnei</strong>
                <span>connecte</span>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Deconnexion">
                <LogOut />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="admin-main">
          <div className="admin-mobile-topbar">
            <SidebarTrigger aria-label="Ouvrir le menu admin" />
            <div>
              <strong>Admin Bnei Yeshivot</strong>
              <span>Gestion des dossiers et paiements</span>
            </div>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
