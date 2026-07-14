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
}: {
  title: string;
  status: "missing" | "received";
  name: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  const [fileName, setFileName] = useState("");

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
          state={fileName ? "done" : "idle"}
        >
          <AttachmentMedia>
            {fileName ? <FileText /> : <UploadCloud />}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{fileName || title}</AttachmentTitle>
            <AttachmentDescription>
              {fileName ? "Fichier selectionne." : "Cliquez pour ajouter la piece."}
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
    </div>
  );
}
