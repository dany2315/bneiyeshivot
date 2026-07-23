"use client";

import { type ChangeEvent, type ReactNode, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { DvarTorahCategory } from "@prisma/client";
import { BookOpenText, FileText, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { createDvarTorahFile } from "@/app/admin/dvar-torah/actions";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

type UploadedFile = {
  key: string;
  url: string;
  mimeType: string;
  size: number;
  name: string;
};

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Une erreur est survenue. Réessayez.";
}

async function uploadDvarTorahPdf(file: File): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("files", file);
  formData.append("prefix", "dvar-torah");

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });
  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    files?: Array<{
      key: string;
      url: string;
      mimeType: string;
      size: number;
    }>;
    message?: string;
  } | null;
  const uploaded = data?.files?.[0];

  if (!response.ok || !data?.ok || !uploaded) {
    throw new Error(data?.message ?? "Upload échoué.");
  }

  return {
    ...uploaded,
    name: file.name,
  };
}

function SubmitButton({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending || disabled} type="submit" variant="accent">
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Enregistrement...
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function AdminDvarTorahAddDialog() {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);

  function resetDialog(input?: HTMLInputElement | null) {
    if (input) {
      input.value = "";
    }
    setUploadedFile(null);
    setUploading(false);
    setFormKey((current) => current + 1);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setUploadedFile(null);

    if (!file) {
      return;
    }

    if (file.type && file.type !== "application/pdf") {
      toast.error("Seuls les fichiers PDF sont acceptés.");
      resetDialog(event.target);
      return;
    }

    setUploading(true);

    try {
      setUploadedFile(await uploadDvarTorahPdf(file));
    } catch (error) {
      toast.error(errorMessage(error));
      resetDialog(event.target);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetDialog(document.getElementById(inputId) as HTMLInputElement | null);
        }
      }}
    >
      <DialogTrigger render={<Button variant="accent" />}>
        <BookOpenText className="size-4" />
        Ajouter un feuillet
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Ajouter un feuillet</DialogTitle>
          <DialogDescription>
            Importez un PDF, choisissez sa catégorie et publiez-le dans la page
            Dvar Torah.
          </DialogDescription>
        </DialogHeader>

        <form
          key={formKey}
          action={async (formData) => {
            if (uploading) {
              toast.error("Attendez la fin de l’upload avant d’enregistrer.");
              return;
            }

            if (!uploadedFile) {
              toast.error("Ajoutez un fichier PDF avant d’enregistrer.");
              return;
            }

            try {
              await createDvarTorahFile(formData);
              toast.success("Feuillet ajouté.");
              setOpen(false);
            } catch (error) {
              toast.error(errorMessage(error));
            }
          }}
          className="grid gap-5"
        >
          <input name="fileKey" type="hidden" value={uploadedFile?.key ?? ""} />
          <input name="fileUrl" type="hidden" value={uploadedFile?.url ?? ""} />
          <input name="mimeType" type="hidden" value={uploadedFile?.mimeType ?? ""} />
          <input name="size" type="hidden" value={uploadedFile?.size ?? ""} />

          <div className="grid gap-2">
            <Label htmlFor="dvar-title">Nom du feuillet</Label>
            <Input
              id="dvar-title"
              name="title"
              placeholder="Ex. : Chabbat Berechit"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dvar-category">Catégorie</Label>
            <NativeSelect
              id="dvar-category"
              name="category"
              className="w-full"
              required
            >
              <NativeSelectOption value={DvarTorahCategory.CHABBAT}>
                Chabbat
              </NativeSelectOption>
              <NativeSelectOption value={DvarTorahCategory.FETE}>
                Fête
              </NativeSelectOption>
            </NativeSelect>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dvar-description">Description</Label>
            <Textarea
              id="dvar-description"
              name="description"
              placeholder="Court texte affiché sur la carte publique."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={inputId}>Fichier PDF</Label>
            <label className="cursor-pointer" htmlFor={inputId}>
              <Attachment
                className="w-full border-[var(--border)] bg-white"
                state={uploading ? "uploading" : uploadedFile ? "done" : "idle"}
              >
                <AttachmentMedia>
                  {uploading ? (
                    <Loader2 className="animate-spin" />
                  ) : uploadedFile ? (
                    <FileText />
                  ) : (
                    <Upload />
                  )}
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>
                    {uploading
                      ? "Upload en cours…"
                      : uploadedFile?.name || "Choisir le PDF"}
                  </AttachmentTitle>
                  <AttachmentDescription>
                    {uploadedFile
                      ? "PDF prêt pour l’enregistrement."
                      : "PDF uniquement."}
                  </AttachmentDescription>
                </AttachmentContent>
                {uploadedFile ? (
                  <AttachmentActions>
                    <AttachmentAction
                      aria-label="Vider la sélection"
                      onClick={(event) => {
                        event.preventDefault();
                        resetDialog(
                          document.getElementById(inputId) as HTMLInputElement | null,
                        );
                      }}
                    >
                      <X className="size-4" />
                    </AttachmentAction>
                  </AttachmentActions>
                ) : null}
              </Attachment>
            </label>
            <input
              accept="application/pdf"
              className="sr-only"
              id={inputId}
              onChange={handleFileChange}
              type="file"
            />
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--subtle)] p-3 text-base font-semibold text-[var(--primary)]">
            <input
              name="published"
              type="checkbox"
              defaultChecked
              className="size-4 accent-[var(--accent)]"
            />
            Publier directement sur le site
          </label>

          <DialogFooter>
            <SubmitButton disabled={uploading || !uploadedFile}>
              <Upload className="size-4" />
              Enregistrer
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
