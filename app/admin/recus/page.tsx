import Link from "next/link";
import {
  CerfaReceiptType,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  ReceiptStatus,
} from "@prisma/client";
import {
  sendCerfaReceipt,
  sendPaymentReceipt,
  updateDonationReceiptStatus,
} from "@/app/admin/dons/actions";
import { StatusBadge } from "@/app/components";
import { AdminShell } from "@/components/admin-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
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
  receiptTypeLabels,
} from "@/lib/donations";
import { fileUrl } from "@/lib/files";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import {
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Mail,
  MoreHorizontal,
  Search,
  Send,
} from "lucide-react";

export const metadata = {
  title: "Admin reçus",
};

type ReceiptDonation = Awaited<ReturnType<typeof getReceiptDonations>>[number];

const receiptStatusLabels: Record<ReceiptStatus, string> = {
  NOT_REQUESTED: "Non demandé",
  REQUESTED: "Demandé",
  GENERATED: "Généré",
  SENT: "Envoyé",
};

function dateLabel(date: Date | null) {
  if (!date) return "-";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function metadataObject(metadata: unknown) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {};
}

function metadataText(metadata: unknown, key: string) {
  const value = metadataObject(metadata)[key];

  return typeof value === "string" ? value : null;
}

function paymentTone(status: PaymentStatus) {
  if (status === "PAID") return "green";
  if (status === "FAILED" || status === "REFUNDED" || status === "CANCELED") {
    return "gold";
  }

  return "blue";
}

function receiptTone(status: ReceiptStatus) {
  if (status === "SENT") return "green";
  if (status === "GENERATED") return "blue";

  return "gold";
}

function canHaveCerfa(donation: ReceiptDonation) {
  return donation.provider !== PaymentProvider.NEDARIM_PLUS && donation.currency === "EUR";
}

function receiptEmail(donation: ReceiptDonation) {
  return metadataText(donation.metadata, "receiptEmail") || donation.donorEmail;
}

function buildWhere(params: Record<string, string | undefined>) {
  const where: Prisma.DonationWhereInput = {};
  const receiptIs: Prisma.ReceiptWhereInput = {};
  const q = params.q?.trim();
  const status = params.status;
  const type = params.type;
  const cerfa = params.cerfa;
  const fiscalYear = Number(params.fiscalYear);

  if (status && Object.values(ReceiptStatus).includes(status as ReceiptStatus)) {
    where.receiptStatus = status as ReceiptStatus;
  }

  if (type && Object.values(CerfaReceiptType).includes(type as CerfaReceiptType)) {
    receiptIs.type = type as CerfaReceiptType;
  }

  if (Number.isInteger(fiscalYear) && fiscalYear > 1900) {
    receiptIs.fiscalYear = fiscalYear;
  }

  if (cerfa === "eligible") {
    where.currency = "EUR";
    where.provider = { not: PaymentProvider.NEDARIM_PLUS };
  }

  if (cerfa === "missing") {
    where.receiptNeeded = true;
    where.receipt = null;
  }

  if (cerfa === "generated") {
    receiptIs.fileKey = { not: null };
  }

  if (Object.keys(receiptIs).length > 0 && cerfa !== "missing") {
    where.receipt = { is: receiptIs };
  }

  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { donorName: { contains: q, mode: "insensitive" } },
      { donorEmail: { contains: q, mode: "insensitive" } },
      { donorPhone: { contains: q, mode: "insensitive" } },
      { receipt: { number: { contains: q, mode: "insensitive" } } },
      { receipt: { donorName: { contains: q, mode: "insensitive" } } },
      { receipt: { donorTaxId: { contains: q, mode: "insensitive" } } },
      { stripePaymentIntentId: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

async function getReceiptDonations(
  params: Record<string, string | undefined> = {},
) {
  return prisma.donation.findMany({
    where: buildWhere(params),
    include: {
      payments: { orderBy: { createdAt: "desc" } },
      receipt: true,
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 250,
  });
}

async function getReceiptStats() {
  const [total, generated, sent, missing, donors] = await Promise.all([
    prisma.donation.count(),
    prisma.receipt.count(),
    prisma.donation.count({ where: { receiptStatus: ReceiptStatus.SENT } }),
    prisma.donation.count({ where: { receiptNeeded: true, receipt: null } }),
    prisma.donation.findMany({
      distinct: ["donorEmail"],
      select: { donorEmail: true },
      where: { donorEmail: { not: "" } },
    }),
  ]);

  return {
    donors: donors.length,
    generated,
    missing,
    sent,
    total,
  };
}

function FilterBar({
  params,
}: {
  params: Record<string, string | undefined>;
}) {
  return (
    <form className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--subtle)]/70 p-3 xl:grid-cols-[minmax(260px,1fr)_160px_170px_150px_130px_auto_auto]">
      <InputGroup className="h-10 bg-white">
        <Search className="ml-3 size-4 text-[var(--muted)]" />
        <InputGroupInput
          defaultValue={params.q ?? ""}
          name="q"
          placeholder="Donateur, email, don, numéro reçu, Cerfa..."
        />
      </InputGroup>
      <NativeSelect defaultValue={params.status ?? ""} name="status">
        <NativeSelectOption value="">Statut reçu</NativeSelectOption>
        {Object.values(ReceiptStatus).map((status) => (
          <NativeSelectOption key={status} value={status}>
            {receiptStatusLabels[status]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect defaultValue={params.cerfa ?? ""} name="cerfa">
        <NativeSelectOption value="">Cerfa</NativeSelectOption>
        <NativeSelectOption value="eligible">Éligible Cerfa</NativeSelectOption>
        <NativeSelectOption value="missing">Cerfa à créer</NativeSelectOption>
        <NativeSelectOption value="generated">PDF généré</NativeSelectOption>
      </NativeSelect>
      <NativeSelect defaultValue={params.type ?? ""} name="type">
        <NativeSelectOption value="">Type</NativeSelectOption>
        {Object.values(CerfaReceiptType).map((type) => (
          <NativeSelectOption key={type} value={type}>
            {receiptTypeLabels[type]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Input
        defaultValue={params.fiscalYear ?? ""}
        name="fiscalYear"
        placeholder="Année"
        type="number"
      />
      <Button type="submit">
        <Search className="size-4" />
        Filtrer
      </Button>
      <Button asChild variant="secondary">
        <Link href="/admin/recus">Réinitialiser</Link>
      </Button>
    </form>
  );
}

function ReceiptStatusForm({ donation }: { donation: ReceiptDonation }) {
  return (
    <form action={updateDonationReceiptStatus} className="flex min-w-48 gap-2">
      <input name="donationId" type="hidden" value={donation.id} />
      <NativeSelect defaultValue={donation.receiptStatus} name="receiptStatus">
        {Object.values(ReceiptStatus).map((status) => (
          <NativeSelectOption key={status} value={status}>
            {receiptStatusLabels[status]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Button size="sm" type="submit" variant="secondary">
        OK
      </Button>
    </form>
  );
}

function ReceiptActions({ donation }: { donation: ReceiptDonation }) {
  const cerfaUrl = fileUrl(donation.receipt?.fileKey);
  const stripeReceiptUrl = metadataText(donation.metadata, "stripeReceiptUrl");
  const eligibleCerfa = canHaveCerfa(donation);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="sm" variant="secondary" />}>
        <MoreHorizontal className="size-4" />
        Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Donateur et don</DropdownMenuLabel>
        <DropdownMenuItem render={<Link href={`/admin/dons?q=${encodeURIComponent(donation.id)}`} />}>
          <Eye className="size-4" />
          Ouvrir le don
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`/admin/dons?q=${encodeURIComponent(donation.donorEmail)}`} />}>
          <Eye className="size-4" />
          Tous les dons du donateur
        </DropdownMenuItem>
        {stripeReceiptUrl ? (
          <DropdownMenuItem render={<a href={stripeReceiptUrl} rel="noreferrer" target="_blank" />}>
            <ExternalLink className="size-4" />
            Voir le reçu de paiement
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem render={<form action={sendPaymentReceipt} />}>
          <input name="donationId" type="hidden" value={donation.id} />
          <button className="flex w-full items-center gap-2" type="submit">
            <Mail className="size-4" />
            Envoyer le reçu de paiement
          </button>
        </DropdownMenuItem>
        {eligibleCerfa ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Reçu Cerfa</DropdownMenuLabel>
            <DropdownMenuItem render={<form action={sendCerfaReceipt} />}>
              <input name="donationId" type="hidden" value={donation.id} />
              <button className="flex w-full items-center gap-2" type="submit">
                <Send className="size-4" />
                Générer / envoyer le Cerfa
              </button>
            </DropdownMenuItem>
            {cerfaUrl ? (
              <>
                <DropdownMenuItem render={<a href={cerfaUrl} rel="noreferrer" target="_blank" />}>
                  <FileText className="size-4" />
                  Voir le Cerfa
                </DropdownMenuItem>
                <DropdownMenuItem render={<a download href={cerfaUrl} />}>
                  <Download className="size-4" />
                  Télécharger le Cerfa
                </DropdownMenuItem>
              </>
            ) : null}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ReceiptBulkDownloadCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export groupé des reçus Cerfa</CardTitle>
        <CardDescription>
          Le ZIP contient un index CSV et les PDF Cerfa émis sur la plage choisie.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action="/admin/dons/recus/download"
          className="grid gap-3 md:grid-cols-[180px_180px_auto]"
          method="get"
        >
          <Input aria-label="Date début" name="from" type="date" />
          <Input aria-label="Date fin" name="to" type="date" />
          <Button className="w-fit" type="submit" variant="secondary">
            <Download className="size-4" />
            Télécharger les Cerfa
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default async function AdminReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdminUser();

  const params = await searchParams;
  const [donations, stats] = await Promise.all([
    getReceiptDonations(params),
    getReceiptStats(),
  ]);

  return (
    <AdminShell>
      <div className="admin-header">
        <div>
          <span className="eyebrow">Paiements</span>
          <h1>Reçus</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link href="/admin/dons/export">
              <Download className="size-4" />
              Export dons CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/dons">
              <FileCheck className="size-4" />
              Gérer les dons
            </Link>
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>{stats.total}</CardTitle>
            <CardDescription>Dons suivis</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{stats.donors}</CardTitle>
            <CardDescription>Donateurs</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{stats.generated}</CardTitle>
            <CardDescription>{stats.sent} envoyés</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{stats.missing}</CardTitle>
            <CardDescription>Cerfa à créer</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <div className="mt-5">
        <ReceiptBulkDownloadCard />
      </div>

      <Card className="mt-5">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Gestion des reçus</CardTitle>
              <CardDescription>
                Recherche par donateur, don, reçu de paiement et reçu Cerfa.
              </CardDescription>
            </div>
            <Badge variant="info" className="px-3 py-2">
              {donations.length} résultat(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FilterBar params={params} />
          <div className="table-wrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donateur</TableHead>
                  <TableHead>Don</TableHead>
                  <TableHead>Reçu paiement</TableHead>
                  <TableHead>Reçu Cerfa</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => {
                  const cerfaUrl = fileUrl(donation.receipt?.fileKey);
                  const stripeReceiptUrl = metadataText(
                    donation.metadata,
                    "stripeReceiptUrl",
                  );
                  const paymentReceiptUrl =
                    metadataText(donation.metadata, "paymentReceiptUrl") ??
                    stripeReceiptUrl;
                  const eligibleCerfa = canHaveCerfa(donation);

                  return (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div className="grid gap-1">
                          <strong>{donation.donorName || donation.donorEmail}</strong>
                          <span className="text-sm text-[var(--muted)]">
                            {donation.donorEmail}
                          </span>
                          <span className="text-xs font-bold text-[var(--muted)]">
                            Envoi reçus : {receiptEmail(donation)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="grid gap-1">
                          <strong>
                            {formatMoney(donation.amountCents, donation.currency)}
                          </strong>
                          <span className="text-sm text-[var(--muted)]">
                            {formatDonationFrequency(
                              donation.frequency,
                              donation.recurringMonths,
                            )}
                          </span>
                          <StatusBadge tone={paymentTone(donation.status)}>
                            {paymentStatusLabels[donation.status]}
                          </StatusBadge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {paymentReceiptUrl ? (
                          <Button asChild size="sm" variant="secondary">
                            <a
                              href={paymentReceiptUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              <ExternalLink className="size-4" />
                              Voir
                            </a>
                          </Button>
                        ) : (
                          <span className="text-sm font-bold text-[var(--muted)]">
                            Aucun lien
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="grid gap-1">
                          <strong>
                            {eligibleCerfa
                              ? donation.receipt?.number ?? "À créer"
                              : "Sans Cerfa"}
                          </strong>
                          <span className="text-sm text-[var(--muted)]">
                            {donation.receipt
                              ? `${receiptTypeLabels[donation.receipt.type]} - ${dateLabel(donation.receipt.issuedAt)}`
                              : eligibleCerfa
                                ? "Reçu fiscal non généré"
                                : "Don non éligible"}
                          </span>
                          {cerfaUrl ? (
                            <Button asChild className="w-fit" size="sm" variant="secondary">
                              <a href={cerfaUrl} rel="noreferrer" target="_blank">
                                <Download className="size-4" />
                                PDF
                              </a>
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="grid gap-2">
                          <StatusBadge tone={receiptTone(donation.receiptStatus)}>
                            {receiptStatusLabels[donation.receiptStatus]}
                          </StatusBadge>
                          <ReceiptStatusForm donation={donation} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <ReceiptActions donation={donation} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
