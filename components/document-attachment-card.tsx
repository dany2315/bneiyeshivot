import { FileText, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DocumentAttachmentCard({
  title,
  status,
}: {
  title: string;
  status: "missing" | "received";
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <FileText className="size-4" />
          </span>
          <div>
            <p className="font-bold text-[var(--primary)]">{title}</p>
            <Badge variant={status === "missing" ? "warning" : "success"}>
              {status === "missing" ? "A ajouter" : "Recu"}
            </Badge>
          </div>
        </div>
        <Button variant="secondary" size="sm">
          <UploadCloud />
          Upload
        </Button>
      </CardContent>
    </Card>
  );
}
