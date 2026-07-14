import {
  ServiceRequestStatus,
  ServiceRequestType,
  type User,
} from "@prisma/client";
import { updateServiceRequest } from "@/app/admin/actions";
import { StatusBadge } from "@/app/components";
import { AdminShell } from "@/components/admin-sidebar";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const statusLabels: Record<ServiceRequestStatus, string> = {
  SUBMITTED: "Deposee",
  IN_REVIEW: "En traitement",
  MISSING_DOCUMENTS: "Documents manquants",
  APPROVED: "Approuvee",
  REJECTED: "Refusee",
  COMPLETED: "Terminee",
};

function statusTone(status: ServiceRequestStatus) {
  if (status === "APPROVED" || status === "COMPLETED") return "green";
  if (status === "MISSING_DOCUMENTS" || status === "REJECTED") return "gold";
  return "blue";
}

function userName(user: User | null) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Bahour";
}

export async function AdminServiceRequestsPage({
  title,
  description,
  type,
  searchParams,
}: {
  title: string;
  description: string;
  type: ServiceRequestType;
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdminUser();
  const params = await searchParams;
  const selectedStatus = Object.values(ServiceRequestStatus).includes(
    params.status as ServiceRequestStatus,
  )
    ? (params.status as ServiceRequestStatus)
    : undefined;
  const q = params.q?.trim();

  const requests = await prisma.serviceRequest.findMany({
    where: {
      type,
      status: selectedStatus,
      OR: q
        ? [
            { user: { email: { contains: q, mode: "insensitive" } } },
            { user: { firstName: { contains: q, mode: "insensitive" } } },
            { user: { lastName: { contains: q, mode: "insensitive" } } },
          ]
        : undefined,
    },
    include: {
      user: true,
      messages: {
        where: { isInternal: false },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell>
      <div className="admin-header">
        <div>
          <span className="eyebrow">Back-office</span>
        </div>
      </div>

      <section className="section admin-section-tight">
        <div className="section-header">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <form className="admin-toolbar">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              className="pl-9"
              defaultValue={q ?? ""}
              name="q"
              placeholder="Rechercher nom, email..."
            />
          </div>
          <NativeSelect
            className="w-full min-w-48"
            defaultValue={selectedStatus ?? ""}
            name="status"
          >
            <NativeSelectOption value="">Tous les statuts</NativeSelectOption>
            {Object.values(ServiceRequestStatus).map((status) => (
              <NativeSelectOption value={status} key={status}>
                {statusLabels[status]}
              </NativeSelectOption>
            ))}
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
                <TableHead>Bahour</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Note publique</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="grid gap-1">
                      <strong>{userName(request.user)}</strong>
                      <span className="text-sm text-[var(--muted)]">
                        {request.user?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={statusTone(request.status)}>
                      {statusLabels[request.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>{request.createdAt.toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    <span className="line-clamp-2 text-sm text-[var(--muted)]">
                      {request.publicNote || "Aucune note"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-5 grid gap-4">
          {requests.map((request) => (
            <Card key={`request-form-${request.id}`}>
              <form action={updateServiceRequest}>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {userName(request.user)} - {request.user?.email}
                  </CardTitle>
                  <CardDescription>
                    Modifier le statut, la note publique et la note interne.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-[190px_1fr_1fr_auto]">
                  <input name="requestId" type="hidden" value={request.id} />
                  <NativeSelect
                    className="w-full"
                    defaultValue={request.status}
                    name="status"
                  >
                    {Object.values(ServiceRequestStatus).map((status) => (
                      <NativeSelectOption value={status} key={status}>
                        {statusLabels[status]}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <Input
                    defaultValue={request.publicNote ?? ""}
                    name="publicNote"
                    placeholder="Note visible par le Bahour"
                  />
                  <Input
                    defaultValue={request.internalNote ?? ""}
                    name="internalNote"
                    placeholder="Note interne admin"
                  />
                  <Button type="submit">Modifier</Button>
                </CardContent>
              </form>
            </Card>
          ))}
          {requests.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Aucune demande</CardTitle>
                <CardDescription>
                  Aucun dossier ne correspond aux filtres actuels.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
