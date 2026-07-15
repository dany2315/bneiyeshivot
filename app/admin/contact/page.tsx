import { ServiceRequestType } from "@prisma/client";
import { AdminServiceRequestsPage } from "@/components/admin-service-requests-page";

export const metadata = {
  title: "Admin contact",
};

export default function AdminContactPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  return (
    <AdminServiceRequestsPage
      description="Gestion des demandes de contact entrantes et du suivi des reponses."
      searchParams={searchParams}
      title="Demandes de contact"
      type={ServiceRequestType.GENERAL_CONTACT}
    />
  );
}
