import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
}

export async function requireBahourUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion");
  }

  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
    redirect("/admin");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await getCurrentUser();

  if (
    !user ||
    (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)
  ) {
    redirect("/admin/connexion");
  }

  return user;
}

export async function redirectAuthenticatedBahour() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/client");
  }
}

export async function redirectAuthenticatedAdmin() {
  const user = await getCurrentUser();

  if (
    user &&
    (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN)
  ) {
    redirect("/admin");
  }
}
