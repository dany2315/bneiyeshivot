import { ServiceRequestType } from "@prisma/client";
import { AdminServiceRequestsPage } from "@/components/admin-service-requests-page";

export const metadata = {
  title: "Admin visa",
};

export default function AdminVisaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  return (
    <AdminServiceRequestsPage
      description="Gestion des demandes de visa étudiant : statut, suivi public, note interne et relances."
      searchParams={searchParams}
      title="Demandes visa étudiant"
      type={ServiceRequestType.VISA_STUDENT}
    />
  );
}
