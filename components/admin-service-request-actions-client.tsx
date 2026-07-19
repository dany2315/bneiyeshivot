"use client";

import { useState } from "react";
import {
  ServiceRequestStatus,
  ServiceRequestType,
  type User,
} from "@prisma/client";
import {
  deleteServiceRequest,
  updateServiceRequest,
  updateServiceRequestData,
  uploadServiceRequestFinalDocument,
} from "@/app/admin/actions";
import { StatusBadge } from "@/app/components";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  Eye,
  FileCheck2,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  Upload,
} from "lucide-react";

const statusLabels: Record<ServiceRequestStatus, string> = {
  SUBMITTED: "Deposee",
  IN_REVIEW: "En traitement",
  MISSING_DOCUMENTS: "Elements a modifier",
  APPROVED: "Approuvee",
  REJECTED: "Refusee",
  COMPLETED: "Terminee",
};

function statusTone(status: ServiceRequestStatus) {
  if (status === "APPROVED" || status === "COMPLETED") return "green";
  if (status === "MISSING_DOCUMENTS" || status === "REJECTED") return "gold";
  return "blue";
}

function userName(user: Pick<User, "firstName" | "lastName"> | null) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Bahour";
}

function originalNameFromKey(fileKey: string) {
  const raw = fileKey.split("/").pop() ?? "";
  return raw.replace(/^\d+-[a-f0-9-]+-/i, "") || raw;
}

function payloadText(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

const editableFieldLabels = [
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

const mainDataLabels = [
  ["firstName", "Prenom"],
  ["lastName", "Nom"],
  ["email", "Email"],
  ["phone", "Telephone"],
  ["parentPhone", "Parents"],
  ["birthDate", "Naissance"],
  ["nationality", "Nationalite"],
  ["passportNumber", "Passeport"],
  ["school", "Yeshiva"],
  ["personStatus", "Statut visa"],
  ["message", "Message"],
] as const;

export type AdminServiceRequestActionView = {
  id: string;
  createdAt: string;
  internalNote: string | null;
  publicNote: string | null;
  status: ServiceRequestStatus;
  type: ServiceRequestType;
  payload: Record<string, unknown>;
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    parentPhone: string | null;
  } | null;
  messages: Array<{ body: string; createdAt: string }>;
  documents: Array<{
    id: string;
    label: string;
    fileKey: string;
    createdAt: string;
  }>;
};

type OpenDialog = "detail" | "files" | "status" | "data" | "final" | "delete" | null;

export function AdminServiceRequestActionsClient({
  request,
}: {
  request: AdminServiceRequestActionView;
}) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const isVisa = request.type === ServiceRequestType.VISA_STUDENT;
  const finalDocumentLabel = isVisa ? "Visa recu" : "Document koupat holim final";
  const requestedFields = new Set(
    Array.isArray(request.payload.__requestedFields)
      ? request.payload.__requestedFields.filter(
          (field): field is string => typeof field === "string",
        )
      : [],
  );
  const visibleEditableFields = editableFieldLabels.filter(
    ([field]) => isVisa || field !== "personStatus",
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon-sm" variant="secondary" />}>
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Actions demande</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setOpenDialog("detail")}>
            <Eye className="size-4" />
            Voir le detail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("files")}>
            <Download className="size-4" />
            Voir les fichiers
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenDialog("status")}>
            <Send className="size-4" />
            Statut / corrections
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("data")}>
            <Pencil className="size-4" />
            Modifier les donnees
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("final")}>
            <Upload className="size-4" />
            Uploader final
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpenDialog("delete")}
            variant="destructive"
          >
            <Trash2 className="size-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openDialog === "detail"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail de la demande</DialogTitle>
            <DialogDescription>
              Informations completes, messages et documents recus.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--subtle)] p-4 md:grid-cols-4">
              <InfoBlock label="Bahour" value={userName(request.user)} />
              <InfoBlock
                label="Email"
                value={request.user?.email || payloadText(request.payload, "email") || "-"}
              />
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
              <InfoBlock
                label="Depot"
                value={new Date(request.createdAt).toLocaleDateString("fr-FR")}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {mainDataLabels
                .filter(([field]) => isVisa || field !== "personStatus")
                .map(([field, label]) => (
                  <InfoBlock
                    boxed
                    key={field}
                    label={label}
                    value={payloadText(request.payload, field) || "-"}
                  />
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
                    key={`${request.id}-${message.createdAt}`}
                  >
                    {message.body}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "files"} onOpenChange={(open) => !open && setOpenDialog(null)}>
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
              Aucun document attache a cette demande.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "status"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Modifier le statut et notifier</DialogTitle>
            <DialogDescription>
              Envoyez une mise a jour ou demandez des corrections precises au bahour.
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
              Message visible par le bahour
              <Textarea
                defaultValue={request.publicNote ?? ""}
                name="publicNote"
                placeholder="Expliquez exactement ce qui manque ou ce qu'il doit modifier."
              />
            </label>
            <div className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--subtle)] p-3">
              <strong className="text-sm text-[var(--primary)]">
                Donnees a modifier dans son espace
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

      <Dialog open={openDialog === "data"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Modifier les donnees du dossier</DialogTitle>
            <DialogDescription>
              Correction manuelle par l&apos;admin, sans email automatique.
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
                      payloadText(request.payload, field) ||
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

      <Dialog open={openDialog === "final"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Uploader le document final</DialogTitle>
            <DialogDescription>
              Le fichier sera ajoute au dossier, le bahour sera notifie et la demande passera en terminee.
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

      <AlertDialog
        open={openDialog === "delete"}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette demande ?</AlertDialogTitle>
            <AlertDialogDescription>
              La demande de {userName(request.user)} sera supprimee avec ses messages,
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
    </>
  );
}

function InfoBlock({
  boxed,
  label,
  value,
}: {
  boxed?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className={boxed ? "rounded-lg border border-[var(--border)] bg-white p-3" : ""}>
      <span className="text-xs font-semibold uppercase text-[var(--muted)]">
        {label}
      </span>
      <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-[var(--primary)]">
        {value}
      </p>
    </div>
  );
}
