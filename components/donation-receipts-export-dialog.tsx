"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

function ExportForm({
  action,
  type,
}: {
  action: string;
  type: "cerfa" | "facture";
}) {
  return (
    <form action={action} className="grid gap-3" method="get">
      <input name="type" type="hidden" value={type} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input aria-label="Date debut" name="from" type="date" />
        <Input aria-label="Date fin" name="to" type="date" />
      </div>
      <Button className="w-fit" type="submit">
        <Download className="size-4" />
        Exporter
      </Button>
    </form>
  );
}

export function DonationReceiptsExportDialog({
  action,
}: {
  action: string;
}) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>
        <Download className="size-4" />
        Exporter les recus
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pr-10">
          <DialogTitle>Exporter mes recus</DialogTitle>
          <DialogDescription>
            Choisissez le type de recu et la plage de dates a exporter.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="cerfa">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cerfa">Recu Cerfa</TabsTrigger>
            <TabsTrigger value="facture">Facture</TabsTrigger>
          </TabsList>
          <TabsContent className="pt-4" value="cerfa">
            <ExportForm action={action} type="cerfa" />
          </TabsContent>
          <TabsContent className="pt-4" value="facture">
            <ExportForm action={action} type="facture" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
