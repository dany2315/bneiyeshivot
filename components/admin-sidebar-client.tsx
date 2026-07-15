"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { signOutRequest } from "@/components/auth-sign-out";
import {
  CalendarDays,
  ChevronRight,
  BookOpenText,
  ClipboardList,
  CreditCard,
  FileCheck,
  Gift,
  Home,
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

type AdminItem = [string, string, LucideIcon];

type AdminSidebarUser = {
  email: string;
  firstName: string | null;
  image: string | null;
  lastName: string | null;
  name: string;
};

const adminGroups: Array<{
  label: string;
  items: AdminItem[];
}> = [
  {
    label: "Pilotage",
    items: [
      ["Dashboard", "/admin", LayoutDashboard],
      ["Utilisateurs", "/admin/utilisateurs", Users],
    ],
  },
  {
    label: "Services",
    items: [
      ["Contact", "/admin/contact", MessageSquare],
      ["Visa etudiant", "/admin/visa", FileCheck],
      ["Koupat Holim", "/admin/koupat-holim", ClipboardList],
      ["Evenements", "/admin/evenements", CalendarDays],
      ["Dvar Torah", "/admin/dvar-torah", BookOpenText],
      ["Talmoudo Beyado", "/admin/talmoudo-beyado", Trophy],
    ],
  },
  {
    label: "Paiements",
    items: [
      ["Boutique", "/admin/boutique", ShoppingBag],
      ["Commandes", "/admin/commandes", CreditCard],
      ["Dons", "/admin/dons", Gift],
      ["Recus", "/admin/recus", FileCheck],
    ],
  },
  {
    label: "Systeme",
    items: [["Parametres", "/admin/parametres", Settings]],
  },
];

function adminDisplayName(admin: AdminSidebarUser) {
  return [admin.firstName, admin.lastName].filter(Boolean).join(" ") || admin.name || admin.email;
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "A"}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function AdminSidebarClient({
  admin,
  children,
}: {
  admin: AdminSidebarUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const displayName = adminDisplayName(admin);

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOutRequest();
    } catch {
      setSigningOut(false);
      toast.error("Impossible de se deconnecter pour le moment.");
      return;
    }

    toast.success("Vous etes deconnecte.");
    router.push("/admin/connexion");
    router.refresh();
  }

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
                    {group.items.map(([label, href, Icon]) => (
                      <SidebarMenuItem key={label}>
                        <SidebarMenuButton
                          render={<Link href={href} />}
                          tooltip={label}
                          isActive={
                            href === "/admin"
                              ? pathname === "/admin"
                              : pathname === href ||
                                pathname.startsWith(`${href}/`)
                          }
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
                <AvatarImage src={admin.image ?? undefined} alt={displayName} />
                <AvatarFallback>{initials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="admin-user-meta">
                <strong>{displayName}</strong>
                <span>{admin.email}</span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Deconnexion"
                disabled={signingOut}
                onClick={handleSignOut}
              >
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
