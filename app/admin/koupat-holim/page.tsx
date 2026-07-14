import { ServiceRequestType } from "@prisma/client";
import { AdminServiceRequestsPage } from "@/components/admin-service-requests-page";

export const metadata = {
  title: "Admin koupat holim",
};

export default function AdminKoupatHolimPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  return (
    <AdminServiceRequestsPage
      description="Gestion des demandes koupat holim : statut, suivi public, note interne et relances."
      searchParams={searchParams}
      title="Demandes koupat holim"
      type={ServiceRequestType.KOUPAT_HOLIM}
    />
  );
}
