"use client";

import { useId, useState } from "react";
import { FileText, ImageIcon, Upload, X } from "lucide-react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { cn } from "@/lib/utils";

type AdminFileInputProps = {
  name: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  title: string;
  description?: string;
  className?: string;
};

function formatFileSummary(files: File[]) {
  if (files.length === 0) {
    return null;
  }

  if (files.length === 1) {
    return files[0].name;
  }

  return `${files.length} fichiers selectionnes`;
}

export function AdminFileInput({
  name,
  accept,
  multiple,
  required,
  title,
  description,
  className,
}: AdminFileInputProps) {
  const id = useId();
  const [files, setFiles] = useState<File[]>([]);
  const summary = formatFileSummary(files);
  const Icon = accept?.includes("image") ? ImageIcon : FileText;

  return (
    <div className={cn("grid gap-2", className)}>
      <label className="cursor-pointer" htmlFor={id}>
        <Attachment
          className="w-full border-[var(--border)] bg-white"
          state={files.length > 0 ? "done" : "idle"}
        >
          <AttachmentMedia>
            {files.length > 0 ? <Icon /> : <Upload />}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{summary || title}</AttachmentTitle>
            <AttachmentDescription>
              {summary
                ? description || "Prêt pour l'envoi."
                : description || "Cliquez pour choisir un fichier."}
            </AttachmentDescription>
          </AttachmentContent>
          {files.length > 0 && (
            <AttachmentActions>
              <AttachmentAction
                aria-label="Vider la selection"
                onClick={(event) => {
                  event.preventDefault();
                  const input = document.getElementById(id) as HTMLInputElement | null;
                  if (input) {
                    input.value = "";
                  }
                  setFiles([]);
                }}
              >
                <X className="size-4" />
              </AttachmentAction>
            </AttachmentActions>
          )}
        </Attachment>
      </label>
      <input
        accept={accept}
        className="sr-only"
        id={id}
        multiple={multiple}
        name={name}
        onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
        required={required}
        type="file"
      />
    </div>
  );
}
