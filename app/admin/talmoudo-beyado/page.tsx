import { UserRole } from "@prisma/client";
import { AdminShell } from "@/components/admin-sidebar";
import { AdminTalmoudoPageClient } from "@/components/admin-talmoudo-page-client";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Admin Talmoudo Beyado",
};

export default async function AdminTalmoudoBeyadoPage() {
  await requireAdminUser();
  const [sessions, bahourim] = await Promise.all([
    prisma.mivhanSession.findMany({
      include: {
        registrations: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { date: "desc" },
    }),
    prisma.user.findMany({
      where: { role: UserRole.CLIENT },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        phone: true,
        parentPhone: true,
        yeshiva: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const totalRegistrations = sessions.reduce(
    (total, session) => total + session.registrations.length,
    0,
  );
  const gradedCount = sessions.reduce(
    (total, session) =>
      total + session.registrations.filter((item) => item.grade !== null).length,
    0,
  );

  return (
    <AdminShell>
      <AdminTalmoudoPageClient
        bahourim={bahourim}
        gradedCount={gradedCount}
        sessions={sessions}
        totalRegistrations={totalRegistrations}
      />
    </AdminShell>
  );
}
