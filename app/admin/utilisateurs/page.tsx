import { UserRole } from "@prisma/client";
import { AdminShell } from "@/components/admin-sidebar";
import { StatusBadge } from "@/app/components";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Filter, Search } from "lucide-react";

export const metadata = {
  title: "Admin utilisateurs",
};

const roleLabels: Record<UserRole, string> = {
  CLIENT: "Bahour",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super admin",
};

function userName(user: {
  firstName: string | null;
  lastName: string | null;
  name: string;
}) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || "Sans nom";
}

function roleTone(role: UserRole) {
  if (role === UserRole.SUPER_ADMIN) return "gold";
  if (role === UserRole.ADMIN) return "blue";
  return "green";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  await requireAdminUser();
  const params = await searchParams;
  const q = params.q?.trim();
  const selectedRole = Object.values(UserRole).includes(params.role as UserRole)
    ? (params.role as UserRole)
    : undefined;

  const users = await prisma.user.findMany({
    where: {
      role: selectedRole,
      OR: q
        ? [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      _count: {
        select: {
          requests: true,
          donations: true,
          eventRegistrations: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell>
      <div className="admin-header">
        <div>
          <span className="eyebrow">Back-office</span>
          <h1>Utilisateurs</h1>
        </div>
      </div>

      <section className="section admin-section-tight">
        <form className="admin-toolbar">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              className="pl-9"
              defaultValue={q ?? ""}
              name="q"
              placeholder="Rechercher prénom, nom ou email..."
            />
          </div>
          <NativeSelect
            className="w-full min-w-48"
            defaultValue={selectedRole ?? ""}
            name="role"
          >
            <NativeSelectOption value="">Tous les rôles</NativeSelectOption>
            <NativeSelectOption value={UserRole.CLIENT}>Bahour</NativeSelectOption>
            <NativeSelectOption value={UserRole.ADMIN}>Admin</NativeSelectOption>
            <NativeSelectOption value={UserRole.SUPER_ADMIN}>
              Super admin
            </NativeSelectOption>
          </NativeSelect>
          <Button type="submit" variant="secondary">
            <Filter />
            Filtrer
          </Button>
        </form>

        <div className="table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Demandes</TableHead>
                <TableHead>Événements</TableHead>
                <TableHead>Dons</TableHead>
                <TableHead>Création</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="grid gap-1">
                      <strong>{userName(user)}</strong>
                      <span className="text-sm text-[var(--muted)]">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={roleTone(user.role)}>
                      {roleLabels[user.role]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>{user._count.requests}</TableCell>
                  <TableCell>{user._count.eventRegistrations}</TableCell>
                  <TableCell>{user._count.donations}</TableCell>
                  <TableCell>{user.createdAt.toLocaleDateString("fr-FR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {users.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Aucun utilisateur</CardTitle>
              <CardDescription>
                Aucun utilisateur ne correspond aux filtres actuels.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </AdminShell>
  );
}
