import { AdminSidebarClient } from "@/components/admin-sidebar-client";
import { requireAdminUser } from "@/lib/session";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminUser();

  return (
    <AdminSidebarClient
      admin={{
        email: admin.email,
        firstName: admin.firstName,
        image: admin.image,
        lastName: admin.lastName,
        name: admin.name,
      }}
    >
      {children}
    </AdminSidebarClient>
  );
}
