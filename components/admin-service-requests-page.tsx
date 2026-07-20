import {
  ServiceRequestStatus,
  ServiceRequestType,
  type User,
} from "@prisma/client";
import Link from "next/link";
import { StatusBadge } from "@/app/components";
import { AdminCreateRequestDialog } from "@/components/admin-create-request-dialog";
import { AdminServiceRequestActionsClient } from "@/components/admin-service-request-actions-client";
import { AdminShell } from "@/components/admin-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
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
import { prisma } from "@/lib/prisma";
import { Filter, Search } from "lucide-react";

const statusLabels: Record<ServiceRequestStatus, string> = {
  SUBMITTED: "Deposee",
  IN_REVIEW: "En traitement",
  MISSING_DOCUMENTS: "Éléments à modifier",
  APPROVED: "Approuvée",
  REJECTED: "Refusée",
  COMPLETED: "Terminée",
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

function payloadObject(payload: unknown) {
  return typeof payload === "object" && payload !== null && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : {};
}

function payloadText(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

/*
Ancien centre d'actions conserve comme reference pendant la transition UI.
Il est commente pour eviter toute imbrication Base UI DropdownMenuItem/DialogTrigger.
function ServiceRequestActionsDialog({
  request,
}: {
  request: RequestWithRelations;
}) {
  const payload = payloadObject(request.payload);
  const requestedFields = requestedFieldsFromPayload(request.payload);
  const isVisa = request.type === ServiceRequestType.VISA_STUDENT;
  const finalDocumentLabel = isVisa ? "Visa reçu" : "Document koupat holim final";

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="secondary" />}>
        <Eye className="size-4" />
        Actions
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {userName(request.user)}
          </DialogTitle>
          <DialogDescription>
Gestion complète de la demande : données, documents, statut, document final et suppression.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--subtle)] p-4 md:grid-cols-4">
          <div>
            <span className="text-xs font-semibold uppercase text-[var(--muted)]">Statut</span>
            <div className="mt-1">
              <StatusBadge tone={statusTone(request.status)}>
                {statusLabels[request.status]}
              </StatusBadge>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-[var(--muted)]">Email</span>
            <p className="mt-1 truncate font-medium">{request.user?.email || payloadText(payload, "email") || "-"}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-[var(--muted)]">Téléphone</span>
            <p className="mt-1 font-medium">{request.user?.phone || payloadText(payload, "phone") || "-"}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-[var(--muted)]">Depot</span>
            <p className="mt-1 font-medium">{request.createdAt.toLocaleDateString("fr-FR")}</p>
          </div>
        </div>

        <Tabs defaultValue="dossier" className="gap-4">
          <TabsList className="w-full flex-wrap justify-start">
            <TabsTrigger value="dossier">Dossier</TabsTrigger>
            <TabsTrigger value="statut">Statut</TabsTrigger>
            <TabsTrigger value="donnees">Données</TabsTrigger>
            <TabsTrigger value="final">Final</TabsTrigger>
            <TabsTrigger value="danger">Supprimer</TabsTrigger>
          </TabsList>

          <TabsContent value="dossier" className="grid gap-5">
            <div className="grid gap-3 md:grid-cols-2">
              {mainDataLabels
                .filter(([field]) => isVisa || field !== "personStatus")
                .map(([field, label]) => (
                  <div
                    className="rounded-lg border border-[var(--border)] bg-white p-3"
                    key={field}
                  >
                    <span className="text-xs font-semibold uppercase text-[var(--muted)]">
                      {label}
                    </span>
                    <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-[var(--primary)]">
                      {payloadText(payload, field) || "-"}
                    </p>
                  </div>
                ))}
            </div>

            <Separator />

            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold text-[var(--primary)]">
                  Documents du Bahour
                </h3>
                <span className="text-sm text-[var(--muted)]">
                  {request.documents.length} fichier(s)
                </span>
              </div>
              {request.documents.length > 0 ? (
                <div className="grid gap-2 md:grid-cols-2">
                  {request.documents.map((document) => (
                    <a
                      className="flex items-start justify-between gap-3 rounded-lg border border-[var(--border)] bg-white p-3 text-sm transition hover:border-[var(--accent)]"
                      href={`/api/requests/documents/${document.id}/download`}
                      key={document.id}
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-semibold text-[var(--primary)]">
                          <Download className="size-4" />
                          {document.label}
                        </span>
                        <span className="mt-1 block truncate text-[var(--muted)]">
                          {originalNameFromKey(document.fileKey)}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-[var(--muted)]">
                        {document.createdAt.toLocaleDateString("fr-FR")}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                  Aucun document attaché à cette demande.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="statut">
            <form action={updateServiceRequest} className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-4">
              <input name="requestId" type="hidden" value={request.id} />
              <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                <label className="grid gap-1 text-sm font-semibold text-[var(--primary)]">
                  Statut de la demande
                  <NativeSelect defaultValue={request.status} name="status">
                    {Object.values(ServiceRequestStatus).map((status) => (
                      <NativeSelectOption value={status} key={status}>
                        {statusLabels[status]}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </label>
                <label className="grid gap-1 text-sm font-semibold text-[var(--primary)]">
                  Note interne
                  <Input
                    defaultValue={request.internalNote ?? ""}
                    name="internalNote"
                    placeholder="Visible uniquement admin"
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm font-semibold text-[var(--primary)]">
                Message public au Bahour
                <Textarea
                  defaultValue={request.publicNote ?? ""}
                  name="publicNote"
                  placeholder="Indiquez clairement ce qui manque ou ce qui change."
                />
              </label>
              <div className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--subtle)] p-3">
                <strong className="text-sm text-[var(--primary)]">
                  Données à faire modifier par le Bahour
                </strong>
                <div className="grid gap-2 md:grid-cols-3">
                  {editableFieldLabels
                    .filter(([field]) => isVisa || field !== "personStatus")
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
                  Ces champs seront demandés au Bahour quand le statut est &quot;Éléments à modifier&quot;.
                </p>
              </div>
              <Button type="submit" className="w-fit">
                <Send className="size-4" />
                Mettre à jour et notifier
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="donnees">
            <form action={updateServiceRequestData} className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-4">
              <input name="requestId" type="hidden" value={request.id} />
              <div className="grid gap-3 md:grid-cols-2">
                {editableFieldLabels
                  .filter(([field]) => isVisa || field !== "personStatus")
                  .map(([field, label]) => (
                    <label className="grid gap-1 text-sm font-semibold text-[var(--primary)]" key={field}>
                      {label}
                      <Input
                        defaultValue={
                          payloadText(payload, field) ||
                          (field === "firstName" ? request.user?.firstName ?? "" : "") ||
                          (field === "lastName" ? request.user?.lastName ?? "" : "") ||
                          (field === "phone" ? request.user?.phone ?? "" : "") ||
                          (field === "parentPhone" ? request.user?.parentPhone ?? "" : "")
                        }
                        name={field}
                      />
                    </label>
                  ))}
              </div>
              <Button type="submit" className="w-fit">
                <Pencil className="size-4" />
                Enregistrer les données
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="final">
            <form action={uploadServiceRequestFinalDocument} className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <input name="requestId" type="hidden" value={request.id} />
              <label className="grid gap-1 text-sm font-semibold text-[var(--primary)]">
                Nom du document final
                <Input
                  name="label"
                  defaultValue={finalDocumentLabel}
                  placeholder="Nom du document"
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-[var(--primary)]">
                Fichier final
                <Input
                  accept="application/pdf,image/*"
                  name="file"
                  required
                  type="file"
                />
              </label>
              <Button type="submit">
                <Upload className="size-4" />
                Terminer
              </Button>
            </form>
            <p className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
              <FileCheck2 className="size-4" />
              L’ajout du document final passe automatiquement la demande en statut Terminée.
            </p>
          </TabsContent>

          <TabsContent value="danger">
            <div className="grid gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="font-bold text-red-900">Supprimer la demande</h3>
              <p className="text-sm text-red-800">
                Cette action supprime la demande, ses messages, ses documents en base, puis les fichiers S3 attachés.
              </p>
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="destructive" />}>
                  <Trash2 className="size-4" />
                  Supprimer la demande et les fichiers
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      La demande de {userName(request.user)} sera supprimée avec ses messages, ses documents et les fichiers S3 attachés.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <form action={deleteServiceRequest}>
                      <input name="requestId" type="hidden" value={request.id} />
                      <AlertDialogAction type="submit" variant="destructive">
                        Supprimer definitivement
                      </AlertDialogAction>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Ancienne implementation remplacee par AdminServiceRequestActionsClient.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ServiceRequestActionsDropdown({
  request,
}: {
  request: RequestWithRelations;
}) {
  const payload = payloadObject(request.payload);
  const requestedFields = requestedFieldsFromPayload(request.payload);
  const isVisa = request.type === ServiceRequestType.VISA_STUDENT;
  const finalDocumentLabel = isVisa ? "Visa reçu" : "Document koupat holim final";
  const visibleEditableFields = editableFieldLabels.filter(
    ([field]) => isVisa || field !== "personStatus",
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="icon-sm" variant="secondary" />}>
        <MoreHorizontal className="size-4" />
        <span className="sr-only">Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Actions demande</DropdownMenuLabel>

        <Dialog>
          <DialogTrigger render={<DropdownMenuItem />}>
            <Eye className="size-4" />
            Voir le detail
          </DialogTrigger>
          <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Détail de la demande</DialogTitle>
              <DialogDescription>
                Informations complètes, messages et documents reçus.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--subtle)] p-4 md:grid-cols-4">
                <div>
                  <span className="text-xs font-semibold uppercase text-[var(--muted)]">
                    Bahour
                  </span>
                  <p className="mt-1 font-semibold">{userName(request.user)}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-[var(--muted)]">
                    Email
                  </span>
                  <p className="mt-1 truncate font-semibold">
                    {request.user?.email || payloadText(payload, "email") || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-[var(--muted)]">
                    Statut
                  </span>
                  <div className="mt-1">
                    <StatusBadge tone={statusTone(request.status)}>
                      {statusLabels[request.status]}
                    </StatusBadge>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-[var(--muted)]">
                    Depot
                  </span>
                  <p className="mt-1 font-semibold">
                    {request.createdAt.toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {mainDataLabels
                  .filter(([field]) => isVisa || field !== "personStatus")
                  .map(([field, label]) => (
                    <div
                      className="rounded-lg border border-[var(--border)] bg-white p-3"
                      key={field}
                    >
                      <span className="text-xs font-semibold uppercase text-[var(--muted)]">
                        {label}
                      </span>
                      <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-[var(--primary)]">
                        {payloadText(payload, field) || "-"}
                      </p>
                    </div>
                  ))}
              </div>
              {request.messages.length > 0 ? (
                <div className="grid gap-2">
                  <h3 className="text-sm font-bold text-[var(--primary)]">
                    Derniers messages
                  </h3>
                  {request.messages.map((message) => (
                    <p
                      className="rounded-lg bg-[var(--subtle)] p-3 text-sm text-[var(--primary)]"
                      key={`${request.id}-${message.createdAt.toISOString()}`}
                    >
                      {message.body}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger render={<DropdownMenuItem />}>
            <Download className="size-4" />
            Voir les fichiers
          </DialogTrigger>
          <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Fichiers de la demande</DialogTitle>
              <DialogDescription>
                Consultez et telechargez les documents envoyes.
              </DialogDescription>
            </DialogHeader>
            {request.documents.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2">
                {request.documents.map((document) => (
                  <a
                    className="flex items-start justify-between gap-3 rounded-lg border border-[var(--border)] bg-white p-3 text-sm transition hover:border-[var(--accent)]"
                    href={`/api/requests/documents/${document.id}/download`}
                    key={document.id}
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-semibold text-[var(--primary)]">
                        <Download className="size-4" />
                        {document.label}
                      </span>
                      <span className="mt-1 block truncate text-[var(--muted)]">
                        {originalNameFromKey(document.fileKey)}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                Aucun document attaché à cette demande.
              </p>
            )}
          </DialogContent>
        </Dialog>

        <DropdownMenuSeparator />

        <Dialog>
          <DialogTrigger render={<DropdownMenuItem />}>
            <Send className="size-4" />
            Statut / corrections
          </DialogTrigger>
          <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Modifier le statut et notifier</DialogTitle>
              <DialogDescription>
                Envoyez une mise à jour ou demandez des corrections précises au Bahour.
              </DialogDescription>
            </DialogHeader>
            <form action={updateServiceRequest} className="grid gap-4">
              <input name="requestId" type="hidden" value={request.id} />
              <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                <label className="grid gap-1 text-sm font-semibold text-[var(--primary)]">
                  Statut
                  <NativeSelect defaultValue={request.status} name="status">
                    {Object.values(ServiceRequestStatus).map((status) => (
                      <NativeSelectOption value={status} key={status}>
                        {statusLabels[status]}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </label>
                <label className="grid gap-1 text-sm font-semibold text-[var(--primary)]">
                  Note interne
                  <Input
                    defaultValue={request.internalNote ?? ""}
                    name="internalNote"
                    placeholder="Visible uniquement admin"
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm font-semibold text-[var(--primary)]">
                Message visible par le Bahour
                <Textarea
                  defaultValue={request.publicNote ?? ""}
                  name="publicNote"
                  placeholder="Expliquez exactement ce qui manque ou ce qu’il doit modifier."
                />
              </label>
              <div className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--subtle)] p-3">
                <strong className="text-sm text-[var(--primary)]">
                  Données à modifier dans son espace
                </strong>
                <div className="grid gap-2 md:grid-cols-3">
                  {visibleEditableFields.map(([field, label]) => (
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
              </div>
              <Button type="submit" className="w-fit">
                <Send className="size-4" />
                Enregistrer et notifier
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger render={<DropdownMenuItem />}>
            <Pencil className="size-4" />
            Modifier les données
          </DialogTrigger>
          <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Modifier les données du dossier</DialogTitle>
              <DialogDescription>
                Correction manuelle par l’admin, sans email automatique.
              </DialogDescription>
            </DialogHeader>
            <form action={updateServiceRequestData} className="grid gap-4">
              <input name="requestId" type="hidden" value={request.id} />
              <div className="grid gap-3 md:grid-cols-2">
                {visibleEditableFields.map(([field, label]) => (
                  <label
                    className="grid gap-1 text-sm font-semibold text-[var(--primary)]"
                    key={field}
                  >
                    {label}
                    <Input
                      defaultValue={
                        payloadText(payload, field) ||
                        (field === "firstName" ? request.user?.firstName ?? "" : "") ||
                        (field === "lastName" ? request.user?.lastName ?? "" : "") ||
                        (field === "phone" ? request.user?.phone ?? "" : "") ||
                        (field === "parentPhone" ? request.user?.parentPhone ?? "" : "")
                      }
                      name={field}
                    />
                  </label>
                ))}
              </div>
              <Button type="submit" className="w-fit">
                <Pencil className="size-4" />
                Enregistrer
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger render={<DropdownMenuItem />}>
            <Upload className="size-4" />
            Uploader final
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Uploader le document final</DialogTitle>
              <DialogDescription>
                Le fichier sera ajouté au dossier, le Bahour sera notifié et la demande passera en terminée.
              </DialogDescription>
            </DialogHeader>
            <form action={uploadServiceRequestFinalDocument} className="grid gap-4">
              <input name="requestId" type="hidden" value={request.id} />
              <label className="grid gap-1 text-sm font-semibold text-[var(--primary)]">
                Nom du document
                <Input
                  name="label"
                  defaultValue={finalDocumentLabel}
                  placeholder="Nom du document"
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-[var(--primary)]">
                Fichier
                <Input
                  accept="application/pdf,image/*"
                  name="file"
                  required
                  type="file"
                />
              </label>
              <Button type="submit" className="w-fit">
                <FileCheck2 className="size-4" />
                Uploader et notifier
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <DropdownMenuSeparator />

        <AlertDialog>
          <AlertDialogTrigger render={<DropdownMenuItem variant="destructive" />}>
            <Trash2 className="size-4" />
            Supprimer
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette demande ?</AlertDialogTitle>
              <AlertDialogDescription>
                La demande de {userName(request.user)} sera supprimée avec ses messages,
                ses documents et les fichiers S3 attaches.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <form action={deleteServiceRequest}>
                <input name="requestId" type="hidden" value={request.id} />
                <AlertDialogAction type="submit" variant="destructive">
                  Supprimer definitivement
                </AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
*/

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
  const statusTabs = [
    { label: "Tous", value: "" },
    ...Object.values(ServiceRequestStatus).map((status) => ({
      label: statusLabels[status],
      value: status,
    })),
  ];
  const statusHref = (status: string) => {
    const search = new URLSearchParams();

    if (q) search.set("q", q);
    if (status) search.set("status", status);

    const query = search.toString();
    return query ? `?${query}` : "?";
  };

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

        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => {
            const active = (selectedStatus ?? "") === tab.value;

            return (
              <Button
                asChild
                key={tab.value || "all"}
                size="sm"
                variant={active ? "default" : "secondary"}
              >
                <Link href={statusHref(tab.value)}>{tab.label}</Link>
              </Button>
            );
          })}
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
                <TableHead>Contact</TableHead>
                <TableHead>Dossier</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const payload = payloadObject(request.payload);

                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="grid gap-1">
                        <strong>{userName(request.user)}</strong>
                        <span className="text-xs text-[var(--muted)]">
                          {payloadText(payload, "passportNumber") || "Passeport non renseigné"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="grid gap-1 text-sm">
                        <span>{request.user?.email || payloadText(payload, "email") || "-"}</span>
                        <span className="text-[var(--muted)]">
                          {request.user?.phone || payloadText(payload, "phone") || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="grid gap-1 text-sm">
                        <span>{payloadText(payload, "school") || "-"}</span>
                        <span className="text-[var(--muted)]">
                          {request.documents.length} document(s)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={statusTone(request.status)}>
                        {statusLabels[request.status]}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{request.createdAt.toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-right">
                      <AdminServiceRequestActionsClient
                        request={{
                          id: request.id,
                          createdAt: request.createdAt.toISOString(),
                          internalNote: request.internalNote,
                          publicNote: request.publicNote,
                          status: request.status,
                          type: request.type,
                          payload,
                          user: request.user
                            ? {
                                email: request.user.email,
                                firstName: request.user.firstName,
                                lastName: request.user.lastName,
                                phone: request.user.phone,
                                parentPhone: request.user.parentPhone,
                              }
                            : null,
                          messages: request.messages.map((message) => ({
                            body: message.body,
                            createdAt: message.createdAt.toISOString(),
                          })),
                          documents: request.documents.map((document) => ({
                            id: document.id,
                            label: document.label,
                            fileKey: document.fileKey,
                            createdAt: document.createdAt.toISOString(),
                          })),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {requests.length === 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Aucune demande</CardTitle>
              <CardDescription>
                Aucun dossier ne correspond aux filtres actuels.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </AdminShell>
  );
}
