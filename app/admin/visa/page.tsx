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
      description="Gestion des demandes de visa etudiant : statut, suivi public, note interne et relances."
      searchParams={searchParams}
      title="Demandes visa etudiant"
      type={ServiceRequestType.VISA_STUDENT}
    />
  );
}
