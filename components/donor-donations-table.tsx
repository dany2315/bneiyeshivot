import { Download, ExternalLink, ReceiptText } from "lucide-react";
import { StatusBadge } from "@/app/components";
import { DonationReceiptsExportDialog } from "@/components/donation-receipts-export-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDonationFrequency,
  formatMoney,
  paymentStatusLabels,
} from "@/lib/donations";
import { fileUrl } from "@/lib/files";

type DonationRow = {
  id: string;
  amountCents: number;
  currency: string;
  frequency: "ONE_TIME" | "MONTHLY";
  recurringMonths: number | null;
  status: keyof typeof paymentStatusLabels;
  paidAt: Date | null;
  createdAt: Date;
  metadata: unknown;
  receipt: {
    fileKey: string | null;
    number: string;
  } | null;
};

function metadataObject(metadata: unknown) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {};
}

function metadataText(metadata: unknown, key: string) {
  const value = metadataObject(metadata)[key];

  return typeof value === "string" ? value : null;
}

function donationTone(status: string) {
  if (status === "PAID") return "green";
  if (status === "REFUNDED" || status === "PARTIALLY_REFUNDED") return "gold";
  return "blue";
}

function dateTimeLabel(date: Date) {
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DonorDonationsTable({
  actionPath,
  donations,
  exportAction = "/donateur/recus/download",
  from,
  title = "Mes dons",
  to,
}: {
  actionPath: string;
  donations: DonationRow[];
  exportAction?: string;
  from?: string;
  title?: string;
  to?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Filtrez par date de don et telechargez vos recus.
            </CardDescription>
          </div>
          <DonationReceiptsExportDialog action={exportAction} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form
          action={actionPath}
          className="grid gap-3 md:grid-cols-[180px_180px_auto]"
          method="get"
        >
          <Input
            aria-label="Date debut"
            defaultValue={from ?? ""}
            name="donFrom"
            type="date"
          />
          <Input
            aria-label="Date fin"
            defaultValue={to ?? ""}
            name="donTo"
            type="date"
          />
          <Button className="w-fit" type="submit" variant="secondary">
            Trier
          </Button>
        </form>

        {donations.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-4 text-sm font-bold text-[var(--muted)]">
            Aucun don trouve sur cette plage.
          </div>
        ) : (
          <div className="table-wrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date du don</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Frequence</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => {
                  const donationDate = donation.paidAt ?? donation.createdAt;
                  const stripeReceiptUrl = metadataText(
                    donation.metadata,
                    "stripeReceiptUrl",
                  );
                  const cerfaUrl = fileUrl(donation.receipt?.fileKey);

                  return (
                    <TableRow key={donation.id}>
                      <TableCell className="font-bold text-[var(--primary)]">
                        {dateTimeLabel(donationDate)}
                      </TableCell>
                      <TableCell>
                        {formatMoney(donation.amountCents, donation.currency)}
                      </TableCell>
                      <TableCell>
                        {formatDonationFrequency(
                          donation.frequency,
                          donation.recurringMonths,
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge tone={donationTone(donation.status)}>
                          {paymentStatusLabels[donation.status]}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {stripeReceiptUrl ? (
                            <Button asChild size="sm" variant="secondary">
                              <a
                                href={stripeReceiptUrl}
                                rel="noreferrer"
                                target="_blank"
                              >
                                <ExternalLink className="size-4" />
                                Facture
                              </a>
                            </Button>
                          ) : null}
                          {cerfaUrl ? (
                            <Button asChild size="sm" variant="secondary">
                              <a href={cerfaUrl} rel="noreferrer" target="_blank">
                                <Download className="size-4" />
                                Cerfa
                              </a>
                            </Button>
                          ) : (
                            <span className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border)] px-3 text-xs font-bold text-[var(--muted)]">
                              <ReceiptText className="size-4" />
                              Cerfa en preparation
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
