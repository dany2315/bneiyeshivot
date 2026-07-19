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
  fileName,
  onFileChange,
  uploadProgress,
}: {
  title: string;
  status: "missing" | "received";
  name: string;
  required?: boolean;
  disabled?: boolean;
  fileName?: string;
  onFileChange?: (file: File | null) => void;
  uploadProgress?: number;
}) {
  const id = useId();
  const [localFileName, setLocalFileName] = useState("");
  const displayFileName = fileName ?? localFileName;
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
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          setLocalFileName(file?.name ?? "");
          onFileChange?.(file);
        }}
        required={required}
        type="file"
      />
      <label
        className={disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
        htmlFor={id}
      >
        <Attachment
          className="w-full border-[var(--border)] bg-white"
          state={isUploading ? "uploading" : displayFileName ? "done" : "idle"}
        >
          <AttachmentMedia>
            {displayFileName ? <FileText /> : <UploadCloud />}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{title}</AttachmentTitle>
            <AttachmentDescription>
              {isUploading
                ? `Upload en cours... ${Math.round(uploadProgress ?? 0)}%`
                : displayFileName
                  ? displayFileName
                  : "Cliquez pour ajouter la piece."}
            </AttachmentDescription>
          </AttachmentContent>
          <Badge variant={displayFileName || status === "received" ? "success" : "warning"}>
            {displayFileName || status === "received" ? "Pret" : "A ajouter"}
          </Badge>
          {displayFileName && (
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
                  setLocalFileName("");
                  onFileChange?.(null);
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
