import { AdminShell } from "@/components/admin-sidebar";
import { AdminTalmoudoPageClient } from "@/components/admin-talmoudo-page-client";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Admin Talmoudo Beyado",
};

export default async function AdminTalmoudoBeyadoPage() {
  await requireAdminUser();
  const sessions = await prisma.mivhanSession.findMany({
    include: {
      registrations: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { date: "desc" },
  });
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
        gradedCount={gradedCount}
        sessions={sessions}
        totalRegistrations={totalRegistrations}
      />
    </AdminShell>
  );
}
