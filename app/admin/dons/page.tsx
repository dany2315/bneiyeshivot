import Link from "next/link";
import {
  CerfaReceiptType,
  DonationSource,
  PaymentStatus,
  Prisma,
  ReceiptStatus,
} from "@prisma/client";
import {
  createManualDonation,
  refundDonation,
  saveDonationReceipt,
  updateDonationAdminNote,
  updateDonationReceiptStatus,
  updateDonationStatus,
} from "./actions";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  donationSourceLabels,
  formatMoney,
  paymentStatusLabels,
  receiptTypeLabels,
} from "@/lib/donations";
import { fileUrl } from "@/lib/files";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import {
  Banknote,
  Download,
  ExternalLink,
  FileText,
  ReceiptText,
  RotateCcw,
  Search,
} from "lucide-react";

export const metadata = {
  title: "Admin dons",
};

type AdminDonation = Awaited<ReturnType<typeof getDonations>>[number];

const receiptStatusLabels: Record<ReceiptStatus, string> = {
  NOT_REQUESTED: "Non demande",
  REQUESTED: "Demande",
  GENERATED: "Genere",
  SENT: "Envoye",
};

function donationTone(status: PaymentStatus) {
  if (status === "PAID") return "green";
  if (status === "FAILED" || status === "REFUNDED" || status === "CANCELED") {
    return "gold";
  }
  return "blue";
}

function dateLabel(date: Date | null) {
  if (!date) return "-";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function dateTimeLabel(date: Date | null) {
  if (!date) return "-";

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function metadataBoolean(metadata: unknown, key: string) {
  const value = metadataObject(metadata)[key];

  return typeof value === "boolean" ? value : null;
}

function stripePaymentUrl(donation: AdminDonation) {
  if (!donation.stripePaymentIntentId) return null;

  return `https://dashboard.stripe.com/test/payments/${donation.stripePaymentIntentId}`;
}

function buildWhere(params: Record<string, string | undefined>) {
  const where: Prisma.DonationWhereInput = {};
  const status = params.status;
  const receipt = params.receipt;
  const source = params.source;
  const q = params.q?.trim();

  if (status && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
    where.status = status as PaymentStatus;
  }

  if (source && Object.values(DonationSource).includes(source as DonationSource)) {
    where.source = source as DonationSource;
  }

  if (receipt && Object.values(ReceiptStatus).includes(receipt as ReceiptStatus)) {
    where.receiptStatus = receipt as ReceiptStatus;
  }

  if (receipt === "MISSING") {
    where.receiptNeeded = true;
    where.receipt = null;
  }

  if (q) {
    where.OR = [
      { donorEmail: { contains: q, mode: "insensitive" } },
      { donorName: { contains: q, mode: "insensitive" } },
      { donorPhone: { contains: q, mode: "insensitive" } },
      { stripePaymentIntentId: { contains: q, mode: "insensitive" } },
      { stripeCheckoutSessionId: { contains: q, mode: "insensitive" } },
      { receipt: { number: { contains: q, mode: "insensitive" } } },
    ];
  }

  return where;
}

async function getDonations(params: Record<string, string | undefined> = {}) {
  return prisma.donation.findMany({
    where: buildWhere(params),
    include: {
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

function ManualDonationDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
        <Banknote className="size-4" />
        Ajouter un don manuel
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Don manuel</DialogTitle>
          <DialogDescription>
            Especes, cheque, virement ou autre. Le don est cree comme paye et
            peut generer directement un recu Cerfa.
          </DialogDescription>
        </DialogHeader>
        <form action={createManualDonation} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="firstName" placeholder="Prenom" />
            <Input name="lastName" placeholder="Nom" />
            <Input name="email" placeholder="Email" required type="email" />
            <Input name="phone" placeholder="Telephone" />
            <Input name="amount" placeholder="Montant" required type="number" />
            <NativeSelect defaultValue="EUR" name="currency">
              <NativeSelectOption value="EUR">EUR</NativeSelectOption>
              <NativeSelectOption value="USD">USD</NativeSelectOption>
              <NativeSelectOption value="ILS">ILS</NativeSelectOption>
            </NativeSelect>
            <NativeSelect defaultValue={DonationSource.ADMIN_CASH} name="source">
              {Object.values(DonationSource)
                .filter((source) => source !== DonationSource.ONLINE)
                .map((source) => (
                  <NativeSelectOption key={source} value={source}>
                    {donationSourceLabels[source]}
                  </NativeSelectOption>
                ))}
            </NativeSelect>
          </div>
          <Textarea name="dedication" placeholder="Dedicace ou note" />
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--primary)]">
            <input name="receiptNeeded" type="checkbox" />
            Recu Cerfa demande
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--primary)]">
            <input name="createReceipt" type="checkbox" />
            Creer le recu maintenant
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <NativeSelect
              defaultValue={CerfaReceiptType.PARTICULIER}
              name="receiptType"
            >
              {Object.values(CerfaReceiptType).map((type) => (
                <NativeSelectOption key={type} value={type}>
                  {receiptTypeLabels[type]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Input name="fiscalYear" placeholder="Annee fiscale" type="number" />
            <Input
              className="sm:col-span-2"
              name="receiptDonorName"
              placeholder="Nom sur le recu"
            />
            <Input
              className="sm:col-span-2"
              name="receiptAddress"
              placeholder="Adresse"
            />
            <Input name="receiptZip" placeholder="Code postal" />
            <Input name="receiptCity" placeholder="Ville" />
            <Input defaultValue="France" name="receiptCountry" placeholder="Pays" />
            <Input name="receiptTaxId" placeholder="SIREN / identifiant fiscal" />
          </div>
          <Button type="submit">Creer le don</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptForm({ donation }: { donation: AdminDonation }) {
  return (
    <form action={saveDonationReceipt} className="grid gap-3">
      <input name="donationId" type="hidden" value={donation.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NativeSelect
          defaultValue={donation.receipt?.type ?? CerfaReceiptType.PARTICULIER}
          name="receiptType"
        >
          {Object.values(CerfaReceiptType).map((type) => (
            <NativeSelectOption key={type} value={type}>
              {receiptTypeLabels[type]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Input
          defaultValue={donation.receipt?.fiscalYear ?? new Date().getFullYear()}
          name="fiscalYear"
          placeholder="Annee fiscale"
          type="number"
        />
        <Input
          className="sm:col-span-2"
          defaultValue={
            donation.receipt?.donorName ??
            donation.donorName ??
            donation.donorEmail
          }
          name="receiptDonorName"
          placeholder="Nom sur le recu"
        />
        <Input
          className="sm:col-span-2"
          defaultValue={donation.receipt?.donorAddress ?? ""}
          name="receiptAddress"
          placeholder="Adresse"
        />
        <Input
          defaultValue={donation.receipt?.donorZip ?? ""}
          name="receiptZip"
          placeholder="Code postal"
        />
        <Input
          defaultValue={donation.receipt?.donorCity ?? ""}
          name="receiptCity"
          placeholder="Ville"
        />
        <Input
          defaultValue={donation.receipt?.donorCountry ?? "France"}
          name="receiptCountry"
          placeholder="Pays"
        />
        <Input
          defaultValue={donation.receipt?.donorTaxId ?? ""}
          name="receiptTaxId"
          placeholder="SIREN / identifiant fiscal"
        />
      </div>
      <Textarea
        defaultValue={donation.receipt?.legalNote ?? ""}
        name="legalNote"
        placeholder="Note interne ou correction du recu"
      />
      <Button type="submit">
        <ReceiptText className="size-4" />
        Enregistrer le recu Cerfa
      </Button>
    </form>
  );
}

function DonationDetailsDialog({ donation }: { donation: AdminDonation }) {
  const metadata = metadataObject(donation.metadata);
  const stripeUrl = stripePaymentUrl(donation);
  const stripeReceiptUrl = metadataText(donation.metadata, "stripeReceiptUrl");
  const cerfaUrl = fileUrl(donation.receipt?.fileKey);

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="secondary" />}>
        <FileText className="size-4" />
        Detail
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{donation.donorName || donation.donorEmail}</DialogTitle>
          <DialogDescription>
            Don {donation.id} - cree le {dateTimeLabel(donation.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{formatMoney(donation.amountCents, donation.currency)}</CardTitle>
              <CardDescription>
                {formatDonationFrequency(
                  donation.frequency,
                  donation.recurringMonths,
                )}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{paymentStatusLabels[donation.status]}</CardTitle>
              <CardDescription>{donationSourceLabels[donation.source]}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{receiptStatusLabels[donation.receiptStatus]}</CardTitle>
              <CardDescription>{donation.receipt?.number ?? "Sans numero"}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations donateur</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm md:grid-cols-2">
            <span>Email: {donation.donorEmail}</span>
            <span>Telephone: {donation.donorPhone ?? "-"}</span>
            <span>Type: {metadataText(donation.metadata, "donorType") ?? "-"}</span>
            <span>Entreprise: {metadataText(donation.metadata, "companyName") ?? "-"}</span>
            <span>Anonyme: {metadataBoolean(donation.metadata, "anonymous") ? "Oui" : "Non"}</span>
            <span>Compte rattache: {donation.user?.email ?? "Non"}</span>
          </CardContent>
        </Card>

        {donation.dedication && (
          <Card>
            <CardHeader>
              <CardTitle>Dedicace</CardTitle>
              <CardDescription>{donation.dedication}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Stripe</CardTitle>
            <CardDescription>
              Checkout, payment intent, subscription et client Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <span>Checkout: {donation.stripeCheckoutSessionId ?? "-"}</span>
            <span>Payment intent: {donation.stripePaymentIntentId ?? "-"}</span>
            <span>Subscription: {donation.stripeSubscriptionId ?? "-"}</span>
            <span>Customer: {donation.stripeCustomerId ?? "-"}</span>
            {stripeUrl && (
              <Button asChild className="w-fit" variant="secondary">
                <a href={stripeUrl} rel="noreferrer" target="_blank">
                  <ExternalLink className="size-4" />
                  Ouvrir dans Stripe
                </a>
              </Button>
            )}
            {stripeReceiptUrl && (
              <Button asChild className="w-fit" variant="secondary">
                <a href={stripeReceiptUrl} rel="noreferrer" target="_blank">
                  <ExternalLink className="size-4" />
                  Recu Stripe
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        {cerfaUrl && (
          <Card>
            <CardHeader>
              <CardTitle>PDF Cerfa</CardTitle>
              <CardDescription>
                Recu fiscal genere automatiquement et stocke sur le don.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <a href={cerfaUrl} rel="noreferrer" target="_blank">
                  <Download className="size-4" />
                  Telecharger le Cerfa PDF
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Statut Cerfa</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateDonationReceiptStatus} className="flex gap-2">
                <input name="donationId" type="hidden" value={donation.id} />
                <NativeSelect defaultValue={donation.receiptStatus} name="receiptStatus">
                  {Object.values(ReceiptStatus).map((status) => (
                    <NativeSelectOption key={status} value={status}>
                      {receiptStatusLabels[status]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <Button type="submit" variant="secondary">
                  OK
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Note interne</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateDonationAdminNote} className="grid gap-3">
                <input name="donationId" type="hidden" value={donation.id} />
                <Textarea
                  defaultValue={
                    typeof metadata.adminNote === "string" ? metadata.adminNote : ""
                  }
                  name="adminNote"
                  placeholder="Note visible seulement par l'admin"
                />
                <Button type="submit" variant="secondary">
                  Enregistrer la note
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Separator />
        <ReceiptForm donation={donation} />
      </DialogContent>
    </Dialog>
  );
}

function RefundDialog({ donation }: { donation: AdminDonation }) {
  if (!donation.stripePaymentIntentId || donation.status !== "PAID") {
    return null;
  }

  const refundableCents = donation.amountCents - donation.refundedAmountCents;

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="ghost" />}>
        <RotateCcw className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rembourser le don</DialogTitle>
          <DialogDescription>
            Solde remboursable: {formatMoney(refundableCents, donation.currency)}.
            Laisser vide pour rembourser le solde complet.
          </DialogDescription>
        </DialogHeader>
        <form action={refundDonation} className="grid gap-3">
          <input name="donationId" type="hidden" value={donation.id} />
          <Input name="refundAmount" placeholder="Montant a rembourser" type="number" />
          <Button type="submit" variant="destructive">
            Rembourser via Stripe
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FilterBar({
  params,
}: {
  params: Record<string, string | undefined>;
}) {
  return (
    <Card className="mt-5">
      <CardContent className="p-4">
        <form className="grid gap-3 lg:grid-cols-[1fr_170px_170px_170px_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              className="pl-9"
              defaultValue={params.q ?? ""}
              name="q"
              placeholder="Nom, email, telephone, recu, Stripe..."
            />
          </div>
          <NativeSelect defaultValue={params.status ?? ""} name="status">
            <NativeSelectOption value="">Tous statuts</NativeSelectOption>
            {Object.values(PaymentStatus).map((status) => (
              <NativeSelectOption key={status} value={status}>
                {paymentStatusLabels[status]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <NativeSelect defaultValue={params.receipt ?? ""} name="receipt">
            <NativeSelectOption value="">Tous recus</NativeSelectOption>
            <NativeSelectOption value="MISSING">A creer</NativeSelectOption>
            {Object.values(ReceiptStatus).map((status) => (
              <NativeSelectOption key={status} value={status}>
                {receiptStatusLabels[status]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <NativeSelect defaultValue={params.source ?? ""} name="source">
            <NativeSelectOption value="">Toutes origines</NativeSelectOption>
            {Object.values(DonationSource).map((source) => (
              <NativeSelectOption key={source} value={source}>
                {donationSourceLabels[source]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button type="submit" variant="secondary">
            Filtrer
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/dons">Reset</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ReceiptBulkDownloadCard() {
  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Telechargement groupe des recus</CardTitle>
        <CardDescription>
          Selectionnez une plage de dates d'emission. Le ZIP contient un index
          CSV et un fichier PDF Cerfa par recu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action="/admin/dons/recus/download"
          className="grid gap-3 md:grid-cols-[180px_180px_auto]"
          method="get"
        >
          <Input aria-label="Date debut" name="from" type="date" />
          <Input aria-label="Date fin" name="to" type="date" />
          <Button className="w-fit" type="submit" variant="secondary">
            <Download className="size-4" />
            Telecharger les recus
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdminUser();

  const params = await searchParams;
  const donations = await getDonations(params);
  const allStatsDonations = await getDonations({});
  const paidDonations = allStatsDonations.filter(
    (donation) => donation.status === "PAID",
  );
  const totalPaidCents = paidDonations.reduce(
    (total, donation) =>
      donation.currency === "EUR" ? total + donation.amountCents : total,
    0,
  );
  const pendingReceipts = allStatsDonations.filter(
    (donation) => donation.receiptNeeded && !donation.receipt,
  ).length;
  const recurringCount = allStatsDonations.filter(
    (donation) => donation.frequency === "MONTHLY",
  ).length;
  const refundedCount = allStatsDonations.filter((donation) =>
    ["REFUNDED", "PARTIALLY_REFUNDED"].includes(donation.status),
  ).length;

  return (
    <AdminShell>
      <div className="admin-header">
        <div>
          <span className="eyebrow">Paiements</span>
          <h1>Dons</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link href="/admin/dons/export">
              <Download className="size-4" />
              Export CSV
            </Link>
          </Button>
          <ManualDonationDialog />
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>{formatMoney(totalPaidCents, "EUR")}</CardTitle>
            <CardDescription>Total EUR reussi</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{pendingReceipts}</CardTitle>
            <CardDescription>Recus Cerfa a creer</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{recurringCount}</CardTitle>
            <CardDescription>Dons mensuels</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{refundedCount}</CardTitle>
            <CardDescription>Remboursements</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <ReceiptBulkDownloadCard />
      <FilterBar params={params} />

      <Card className="mt-5">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Suivi des dons</CardTitle>
              <CardDescription>
                Paiements Stripe, dons manuels, Cerfa, remboursements, notes et
                recherche.
              </CardDescription>
            </div>
            <Badge variant="info" className="px-3 py-2">
              {donations.length} resultat(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="table-wrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donateur</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Origine</TableHead>
                  <TableHead>Cerfa</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div className="grid">
                        <strong>{donation.donorName || donation.donorEmail}</strong>
                        <span className="text-sm text-[var(--muted)]">
                          {donation.donorEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="grid">
                        <strong>
                          {formatMoney(donation.amountCents, donation.currency)}
                        </strong>
                        <span className="text-sm text-[var(--muted)]">
                          {formatDonationFrequency(
                            donation.frequency,
                            donation.recurringMonths,
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={donationTone(donation.status)}>
                        {paymentStatusLabels[donation.status]}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{donationSourceLabels[donation.source]}</TableCell>
                    <TableCell>
                      <div className="grid">
                        <strong>
                          {donation.receipt?.number ??
                            receiptStatusLabels[donation.receiptStatus]}
                        </strong>
                        <span className="text-sm text-[var(--muted)]">
                          {donation.receiptNeeded ? "Demande" : "Non demande"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{dateLabel(donation.paidAt ?? donation.createdAt)}</TableCell>
                    <TableCell>
                      <div className="admin-table-actions">
                        <DonationDetailsDialog donation={donation} />

                        <form action={updateDonationStatus} className="flex gap-2">
                          <input
                            name="donationId"
                            type="hidden"
                            value={donation.id}
                          />
                          <NativeSelect
                            className="w-36"
                            defaultValue={donation.status}
                            name="status"
                            size="sm"
                          >
                            {Object.values(PaymentStatus).map((status) => (
                              <NativeSelectOption key={status} value={status}>
                                {paymentStatusLabels[status]}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                          <Button size="sm" type="submit" variant="secondary">
                            OK
                          </Button>
                        </form>

                        <RefundDialog donation={donation} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
