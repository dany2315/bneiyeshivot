"use client";

import { useId, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";

export function DocumentAttachmentCard({
  title,
  status,
  name,
  required,
  disabled,
  uploadProgress,
}: {
  title: string;
  status: "missing" | "received";
  name: string;
  required?: boolean;
  disabled?: boolean;
  uploadProgress?: number;
}) {
  const id = useId();
  const [fileName, setFileName] = useState("");
  const isUploading =
    typeof uploadProgress === "number" && uploadProgress > 0 && uploadProgress < 100;

  return (
    <div className="grid gap-2">
      <input
        accept="application/pdf,image/*"
        className="sr-only"
        id={id}
        disabled={disabled}
        name={name}
        onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
        required={required}
        type="file"
      />
      <label
        className={disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
        htmlFor={id}
      >
        <Attachment
          className="w-full border-[var(--border)] bg-white"
          state={isUploading ? "uploading" : fileName ? "done" : "idle"}
        >
          <AttachmentMedia>
            {fileName ? <FileText /> : <UploadCloud />}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{fileName || title}</AttachmentTitle>
            <AttachmentDescription>
              {isUploading
                ? `Upload en cours... ${Math.round(uploadProgress ?? 0)}%`
                : fileName
                  ? "Fichier selectionne."
                  : "Cliquez pour ajouter la piece."}
            </AttachmentDescription>
          </AttachmentContent>
          <Badge variant={fileName || status === "received" ? "success" : "warning"}>
            {fileName || status === "received" ? "Pret" : "A ajouter"}
          </Badge>
          {fileName && (
            <AttachmentActions>
              <AttachmentAction
                aria-label="Retirer le fichier"
                disabled={disabled}
                onClick={(event) => {
                  event.preventDefault();
                  if (disabled) return;
                  const input = document.getElementById(id) as HTMLInputElement | null;
                  if (input) {
                    input.value = "";
                  }
                  setFileName("");
                }}
              >
                <X className="size-4" />
              </AttachmentAction>
            </AttachmentActions>
          )}
        </Attachment>
      </label>
      {typeof uploadProgress === "number" && uploadProgress > 0 ? (
        <div className="h-2 overflow-hidden rounded-full bg-[var(--subtle)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${Math.max(0, Math.min(100, uploadProgress))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
