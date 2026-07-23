"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ServiceRequestStatus,
  ServiceRequestType,
  type User,
} from "@prisma/client";
import {
  deleteServiceRequest,
  deleteServiceRequestDocument,
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
  ExternalLink,
  FileCheck2,
  FileText,
  Loader2,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Send,
  Trash2,
  Upload,
} from "lucide-react";

const statusLabels: Record<ServiceRequestStatus, string> = {
  SUBMITTED: "Déposée",
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
  ["firstName", "Prénom"],
  ["lastName", "Nom"],
  ["phone", "Téléphone"],
  ["parentPhone", "Téléphone des parents"],
  ["birthDate", "Date de naissance"],
  ["nationality", "Nationalité"],
  ["passportNumber", "Numéro de passeport"],
  ["school", "Yeshiva / programme"],
  ["personStatus", "Statut visa"],
] as const;

const mainDataLabels = [
  ["firstName", "Prénom"],
  ["lastName", "Nom"],
  ["email", "Email"],
  ["phone", "Téléphone"],
  ["parentPhone", "Parents"],
  ["birthDate", "Naissance"],
  ["nationality", "Nationalité"],
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

type OpenDialog = "detail" | "status" | "data" | "final" | "delete" | null;

function actionErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AdminServiceRequestActionsClient({
  request,
}: {
  request: AdminServiceRequestActionView;
}) {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [documentToDelete, setDocumentToDelete] = useState<
    AdminServiceRequestActionView["documents"][number] | null
  >(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingData, setIsUpdatingData] = useState(false);
  const [isDeletingDocument, setIsDeletingDocument] = useState(false);
  const isVisa = request.type === ServiceRequestType.VISA_STUDENT;
  const finalDocumentLabel = isVisa ? "Visa reçu" : "Document koupat holim final";
  const requestedFields = new Set(
    Array.isArray(request.payload.__requestedFields)
      ? request.payload.__requestedFields.filter(
          (field): field is string => typeof field === "string",
        )
      : [],
  );
  const requestedDocumentIds = new Set(
    Array.isArray(request.payload.__requestedDocumentIds)
      ? request.payload.__requestedDocumentIds.filter(
          (documentId): documentId is string => typeof documentId === "string",
        )
      : [],
  );
  const visibleEditableFields = editableFieldLabels.filter(
    ([field]) => isVisa || field !== "personStatus",
  );

  async function handleStatusSubmit(formData: FormData) {
    setIsUpdatingStatus(true);
    const toastId = toast.loading("Envoi de la notification au Bahour...");

    try {
      await updateServiceRequest(formData);
      toast.success("Notification envoyée au Bahour.", { id: toastId });
      setOpenDialog(null);
      router.refresh();
    } catch (error) {
      toast.error(
        actionErrorMessage(error, "Impossible d’envoyer la notification."),
        { id: toastId },
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleDataSubmit(formData: FormData) {
    setIsUpdatingData(true);
    const toastId = toast.loading("Mise à jour du dossier...");

    try {
      await updateServiceRequestData(formData);
      toast.success("Dossier mis à jour.", { id: toastId });
      setOpenDialog(null);
      router.refresh();
    } catch (error) {
      toast.error(
        actionErrorMessage(error, "Impossible de mettre à jour le dossier."),
        { id: toastId },
      );
    } finally {
      setIsUpdatingData(false);
    }
  }

  async function handleDeleteDocument() {
    if (!documentToDelete) return;

    setIsDeletingDocument(true);
    const toastId = toast.loading("Suppression du fichier...");
    const formData = new FormData();
    formData.set("documentId", documentToDelete.id);

    try {
      await deleteServiceRequestDocument(formData);
      toast.success("Fichier supprimé du dossier et de S3.", { id: toastId });
      setDocumentToDelete(null);
      router.refresh();
    } catch (error) {
      toast.error(
        actionErrorMessage(error, "Impossible de supprimer ce fichier."),
        { id: toastId },
      );
    } finally {
      setIsDeletingDocument(false);
    }
  }

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
            Voir le détail
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenDialog("status")}>
            <Send className="size-4" />
            Statut / corrections
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("data")}>
            <Pencil className="size-4" />
            Modifier les données
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
            <DialogTitle>Détail de la demande</DialogTitle>
            <DialogDescription>
              Informations complètes, messages et documents reçus.
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
                label="Dépôt"
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
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-[var(--primary)]">
                  Documents du Bahour
                </h3>
                <span className="text-sm text-[var(--muted)]">
                  {request.documents.length} fichier(s)
                </span>
              </div>
              {request.documents.length > 0 ? (
                <div className="grid gap-2 md:grid-cols-2">
                  {request.documents.map((document) => (
                    <div
                      className="grid gap-3 rounded-lg border border-[var(--border)] bg-white p-3 text-sm"
                      key={document.id}
                    >
                      <span className="min-w-0">
                        <span className="font-semibold text-[var(--primary)]">
                          {document.label}
                        </span>
                        <span className="mt-1 block truncate text-[var(--muted)]">
                          {originalNameFromKey(document.fileKey)}
                        </span>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="secondary">
                          <a
                            href={`/api/requests/documents/${document.id}/download?disposition=inline`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <ExternalLink className="size-4" />
                            Ouvrir
                          </a>
                        </Button>
                        <Button asChild size="sm" variant="secondary">
                          <a href={`/api/requests/documents/${document.id}/download`}>
                            <Download className="size-4" />
                            Télécharger
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                  Aucun document attaché à cette demande.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "status"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Modifier le statut et notifier</DialogTitle>
            <DialogDescription>
              Envoyez une mise à jour ou demandez des corrections précises au Bahour.
            </DialogDescription>
          </DialogHeader>
          <form action={handleStatusSubmit} className="grid gap-4">
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
            <div className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--subtle)] p-3">
              <strong className="text-sm text-[var(--primary)]">
                Fichiers à modifier dans son espace
              </strong>
              {request.documents.length > 0 ? (
                <div className="grid gap-2 md:grid-cols-2">
                  {request.documents.map((document) => (
                    <label
                      className="flex items-center gap-2 text-sm text-[var(--primary)]"
                      key={document.id}
                    >
                      <input
                        defaultChecked={requestedDocumentIds.has(document.id)}
                        name="requestedDocumentIds"
                        type="checkbox"
                        value={document.id}
                      />
                      <span className="min-w-0 truncate">{document.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  Aucun fichier reçu pour cette demande.
                </p>
              )}
            </div>
            <Button disabled={isUpdatingStatus} type="submit" className="w-fit">
              {isUpdatingStatus ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {isUpdatingStatus ? "Envoi..." : "Enregistrer et notifier"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "data"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Modifier les données du dossier</DialogTitle>
            <DialogDescription>
              Correction manuelle par l’admin, sans email automatique.
            </DialogDescription>
          </DialogHeader>
          <form action={handleDataSubmit} className="grid gap-4">
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
            <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--subtle)] p-3">
              <strong className="text-sm text-[var(--primary)]">
                Fichiers du dossier
              </strong>
              {request.documents.length > 0 ? (
                <div className="grid gap-3">
                  {request.documents.map((document) => (
                    <div
                      className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm"
                      key={document.id}
                    >
                      <input name="documentId" type="hidden" value={document.id} />
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                          <FileText className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[var(--primary)]">
                            {document.label}
                          </p>
                          <p className="mt-1 flex min-w-0 items-center gap-1 truncate text-xs text-[var(--muted)]">
                            <Paperclip className="size-3.5 shrink-0" />
                            <span className="truncate">
                              {originalNameFromKey(document.fileKey)}
                            </span>
                          </p>
                        </div>
                        <Button
                          onClick={() => setDocumentToDelete(document)}
                          size="sm"
                          type="button"
                          variant="destructive"
                        >
                          <Trash2 className="size-4" />
                          Supprimer
                        </Button>
                      </div>
                      <label className="grid gap-1 text-sm font-semibold text-[var(--primary)]">
                        Nom du fichier
                        <Input
                          defaultValue={document.label}
                          name="documentLabel"
                        />
                      </label>
                      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--subtle)] p-3">
                        <label className="grid gap-2 text-sm font-semibold text-[var(--primary)]">
                          <span className="flex items-center gap-2">
                            <Paperclip className="size-4 text-[var(--accent)]" />
                            Remplacer le fichier
                          </span>
                          <Input
                            accept="application/pdf,image/*"
                            name="documentFile"
                            type="file"
                          />
                        </label>
                        <p className="mt-2 text-xs text-[var(--muted)]">
                          L’ancien fichier S3 sera supprimé uniquement après l’enregistrement du remplacement.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  Aucun fichier reçu pour cette demande.
                </p>
              )}
            </div>
            <Button disabled={isUpdatingData} type="submit" className="w-fit">
              {isUpdatingData ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Pencil className="size-4" />
              )}
              {isUpdatingData ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "final"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Uploader le document final</DialogTitle>
            <DialogDescription>
              Le fichier sera ajouté au dossier, le Bahour sera notifié et la demande passera au statut Terminée.
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
        open={Boolean(documentToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeletingDocument) setDocumentToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce fichier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le fichier
              {documentToDelete ? ` « ${documentToDelete.label} »` : ""} ?
              Il sera supprimé du dossier et de S3.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingDocument}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingDocument}
              onClick={handleDeleteDocument}
              type="button"
              variant="destructive"
            >
              {isDeletingDocument ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {isDeletingDocument ? "Suppression..." : "Oui, supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={openDialog === "delete"}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette demande ?</AlertDialogTitle>
            <AlertDialogDescription>
              La demande de {userName(request.user)} sera supprimée avec ses messages,
              ses documents et les fichiers S3 attachés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <form action={deleteServiceRequest}>
              <input name="requestId" type="hidden" value={request.id} />
              <AlertDialogAction type="submit" variant="destructive">
                Supprimer définitivement
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
