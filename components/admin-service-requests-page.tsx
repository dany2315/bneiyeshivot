import {
  ServiceRequestStatus,
  ServiceRequestType,
  type User,
} from "@prisma/client";
import {
  updateServiceRequest,
  uploadServiceRequestFinalDocument,
} from "@/app/admin/actions";
import { StatusBadge } from "@/app/components";
import { AdminCreateRequestDialog } from "@/components/admin-create-request-dialog";
import { AdminShell } from "@/components/admin-sidebar";
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
import { Textarea } from "@/components/ui/textarea";
import { Download, Filter, Search, Upload } from "lucide-react";

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

function requestDialogType(type: ServiceRequestType) {
  if (type === ServiceRequestType.VISA_STUDENT) return "visa";
  if (type === ServiceRequestType.KOUPAT_HOLIM) return "koupat";
  return null;
}

function originalNameFromKey(fileKey: string) {
  const raw = fileKey.split("/").pop() ?? "";
  return raw.replace(/^\d+-[a-f0-9-]+-/i, "") || raw;
}

const requestFieldLabels = [
  ["firstName", "Prenom"],
  ["lastName", "Nom"],
  ["phone", "Telephone"],
  ["parentPhone", "Telephone des parents"],
  ["birthDate", "Date de naissance"],
  ["nationality", "Nationalite"],
  ["passportNumber", "Numero de passeport"],
  ["school", "Yeshiva / programme"],
  ["personStatus", "Statut visa"],
] as const;

function requestedFieldsFromPayload(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return new Set<string>();
  const fields = (payload as Record<string, unknown>).__requestedFields;

  if (!Array.isArray(fields)) return new Set<string>();
  return new Set(fields.filter((field): field is string => typeof field === "string"));
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
  const params = await searchParams;
  const selectedStatus = Object.values(ServiceRequestStatus).includes(
    params.status as ServiceRequestStatus,
  )
    ? (params.status as ServiceRequestStatus)
    : undefined;
  const q = params.q?.trim();
  const dialogType = requestDialogType(type);

  const requests = await prisma.serviceRequest.findMany({
    where: {
      type,
      status: selectedStatus,
      OR: q
        ? [
            { user: { email: { contains: q, mode: "insensitive" } } },
            { user: { firstName: { contains: q, mode: "insensitive" } } },
            { user: { lastName: { contains: q, mode: "insensitive" } } },
            { user: { phone: { contains: q, mode: "insensitive" } } },
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
      documents: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell>
      <div className="admin-header">
        <div>
          <span className="eyebrow">Back-office</span>
          <h1>{title}</h1>
        </div>
        {dialogType && <AdminCreateRequestDialog type={dialogType} />}
      </div>

      <section className="section admin-section-tight">
        <div className="section-header">
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
            <Card
              id={`request-${request.id}`}
              key={`request-form-${request.id}`}
              className="scroll-mt-24"
            >
              <form action={updateServiceRequest}>
                {(() => {
                  const requestedFields = requestedFieldsFromPayload(request.payload);

                  return (
                    <>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {userName(request.user)} - {request.user?.email}
                  </CardTitle>
                  <CardDescription>
                    Modifier le statut, envoyer une consigne au Bahour et gerer
                    les documents.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <input name="requestId" type="hidden" value={request.id} />
                  <div className="grid gap-3 md:grid-cols-[190px_1fr]">
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
                      defaultValue={request.internalNote ?? ""}
                      name="internalNote"
                      placeholder="Note interne admin"
                    />
                  </div>
                  <Textarea
                    defaultValue={request.publicNote ?? ""}
                    name="publicNote"
                    placeholder="Message visible par le Bahour : indiquez precisement les donnees a modifier."
                  />
                  <div className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-3">
                    <strong className="text-sm text-[var(--primary)]">
                      Donnees que le Bahour doit modifier
                    </strong>
                    <div className="grid gap-2 md:grid-cols-3">
                      {requestFieldLabels
                        .filter(([field]) =>
                          request.type === ServiceRequestType.VISA_STUDENT
                            ? true
                            : field !== "personStatus",
                        )
                        .map(([field, label]) => (
                          <label
                            className="flex items-center gap-2 text-sm text-[var(--primary)]"
                            key={field}
                          >
                            <input
                              defaultChecked={requestedFields.has(field)}
                              name="requestedFields"
                              type="checkbox"
                              value={field}
                            />
                            {label}
                          </label>
                        ))}
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      Si le statut est Documents manquants, seuls ces champs
                      apparaitront dans l&apos;espace Bahour.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <strong className="text-sm text-[var(--primary)]">
                      Documents de la demande
                    </strong>
                    {request.documents.length > 0 ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        {request.documents.map((document) => (
                          <a
                            className="rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-3 text-sm hover:bg-white"
                            href={`/api/requests/documents/${document.id}/download`}
                            key={document.id}
                          >
                            <span className="flex items-center gap-2 font-semibold text-[var(--primary)]">
                              <Download className="size-4" />
                              {document.label}
                            </span>
                            <span className="mt-1 block truncate text-[var(--muted)]">
                              {originalNameFromKey(document.fileKey)}
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--muted)]">
                        Aucun document attache.
                      </p>
                    )}
                  </div>
                  <Button type="submit">Mettre a jour et notifier</Button>
                </CardContent>
                    </>
                  );
                })()}
              </form>
              <form action={uploadServiceRequestFinalDocument}>
                <CardContent className="grid gap-3 border-t border-[var(--border)] pt-4 md:grid-cols-[1fr_1fr_auto]">
                  <input name="requestId" type="hidden" value={request.id} />
                  <Input
                    name="label"
                    defaultValue={
                      request.type === ServiceRequestType.VISA_STUDENT
                        ? "Visa recu"
                        : "Document final"
                    }
                    placeholder="Nom du document"
                  />
                  <Input
                    accept="application/pdf,image/*"
                    name="file"
                    required
                    type="file"
                  />
                  <Button type="submit" variant="secondary">
                    <Upload className="size-4" />
                    Ajouter
                  </Button>
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
