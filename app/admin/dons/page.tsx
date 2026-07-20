import Link from "next/link";
import {
  DonationFrequency,
  DonationSource,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  ReceiptStatus,
} from "@prisma/client";
import {
  deleteManualDonation,
  updateDonationAdminNote,
} from "./actions";
import { DonationActionsDropdown } from "./_components/donation-actions-dropdown";
import { ManualDonationDialog } from "./_components/manual-donation-dialog";
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
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
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
  formatMoney,
  paymentStatusLabels,
} from "@/lib/donations";
import { fileUrl } from "@/lib/files";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import {
  Download,
  ExternalLink,
  FileText,
  Search,
  Trash2,
} from "lucide-react";

export const metadata = {
  title: "Admin dons",
};

type AdminDonation = Awaited<ReturnType<typeof getDonations>>[number];

const donationProviderLabels: Record<PaymentProvider, string> = {
  STRIPE: "Stripe",
  NEDARIM_PLUS: "Nedarim Plus",
};

function donationTone(status: PaymentStatus) {
  if (status === "PAID") return "green";
  if (status === "FAILED" || status === "REFUNDED" || status === "CANCELED") {
    return "gold";
  }
  return "blue";
}

function rowPaymentStatus(donation: AdminDonation) {
  if (
    donation.status === "REFUNDED" ||
    donation.status === "PARTIALLY_REFUNDED"
  ) {
    return PaymentStatus.PAID;
  }

  return donation.status;
}

function donationOriginLabel(donation: AdminDonation) {
  if (donation.source !== DonationSource.ONLINE) return "Manuel";

  return donation.provider === PaymentProvider.NEDARIM_PLUS
    ? "Nedarim Plus"
    : "Stripe";
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

function metadataNestedText(metadata: unknown, parent: string, key: string) {
  const value = metadataObject(metadataObject(metadata)[parent])[key];

  return typeof value === "string" ? value : null;
}

function metadataNestedRecord(metadata: unknown, key: string) {
  return metadataObject(metadataObject(metadata)[key]);
}

function stripePaymentUrl(donation: AdminDonation) {
  if (!donation.stripePaymentIntentId) return null;

  return `https://dashboard.stripe.com/test/payments/${donation.stripePaymentIntentId}`;
}

function canShowCerfaControls(donation: AdminDonation) {
  return donation.provider !== PaymentProvider.NEDARIM_PLUS && donation.currency === "EUR";
}

function donationActionsProps(donation: AdminDonation) {
  const receiptAddress = metadataNestedText(donation.metadata, "receipt", "address");
  const receiptZip = metadataNestedText(donation.metadata, "receipt", "zip");
  const receiptCity = metadataNestedText(donation.metadata, "receipt", "city");
  const receiptCountry =
    metadataNestedText(donation.metadata, "receipt", "country") ?? "France";
  const receiptTaxId = metadataNestedText(donation.metadata, "receipt", "taxId");
  const donorType: "PARTICULIER" | "ENTREPRISE" =
    metadataText(donation.metadata, "donorType") === "ENTREPRISE"
      ? "ENTREPRISE"
      : "PARTICULIER";
  const metadata = metadataObject(donation.metadata);
  const refundableCents = Math.max(
    0,
    donation.amountCents - donation.refundedAmountCents,
  );

  return {
    canEditFiscal: canShowCerfaControls(donation),
    canRefund:
      Boolean(donation.stripePaymentIntentId) &&
      donation.status === PaymentStatus.PAID &&
      refundableCents > 0,
    cerfaUrl: fileUrl(donation.receipt?.fileKey),
    donationId: donation.id,
    donorEmail: donation.donorEmail,
    fiscalDefaults: {
      adminNote: typeof metadata.adminNote === "string" ? metadata.adminNote : "",
      amount: String(donation.amountCents / 100),
      companyLegalForm:
        metadataText(donation.metadata, "companyLegalForm") ?? "",
      companyName: metadataText(donation.metadata, "companyName") ?? "",
      currency: donation.currency,
      dedication: donation.dedication ?? "",
      donorType,
      firstName: donation.donorFirstName ?? "",
      lastName: donation.donorLastName ?? "",
      paidAt: donation.paidAt ? donation.paidAt.toISOString().slice(0, 10) : "",
      phone: donation.donorPhone ?? "",
      receiptAddress: receiptAddress ?? donation.receipt?.donorAddress ?? "",
      receiptCity: receiptCity ?? donation.receipt?.donorCity ?? "",
      receiptCountry,
      receiptDonorName:
        donation.receipt?.donorName ?? donation.donorName ?? donation.donorEmail,
      receiptEmail: metadataText(donation.metadata, "receiptEmail") ?? "",
      receiptTaxId: receiptTaxId ?? donation.receipt?.donorTaxId ?? "",
      receiptZip: receiptZip ?? donation.receipt?.donorZip ?? "",
      source: donation.source,
      status: donation.status,
    },
    hasCerfa: canShowCerfaControls(donation),
    refundableAmountLabel:
      refundableCents > 0 ? formatMoney(refundableCents, donation.currency) : null,
    stripeReceiptUrl: metadataText(donation.metadata, "stripeReceiptUrl"),
  };
}

function installmentLabel(payment: AdminDonation["payments"][number]) {
  if (!payment.installmentNumber) return "Paiement";

  return `${payment.installmentNumber} / ${
    payment.installmentTotal ?? "sans limite"
  }`;
}

function currentInstallmentLabel(donation: AdminDonation) {
  if (donation.frequency !== "MONTHLY") return null;

  const payment = [...donation.payments]
    .filter((item) => item.installmentNumber)
    .sort(
      (left, right) =>
        (right.installmentNumber ?? 0) - (left.installmentNumber ?? 0),
    )[0];

  if (!payment) {
    return donation.recurringMonths ? `0 / ${donation.recurringMonths}` : "0 / sans limite";
  }

  return installmentLabel(payment);
}

function paymentRowStatusLabel(status: PaymentStatus) {
  if (status === "REFUNDED" || status === "PARTIALLY_REFUNDED") {
    return "Rembourse";
  }

  return paymentStatusLabels[status];
}

function isReceiptSent(donation: AdminDonation) {
  const metadata = metadataObject(donation.metadata);

  return (
    donation.receiptStatus === ReceiptStatus.SENT ||
    typeof metadata.cerfaEmailSentAt === "string"
  );
}

function buildWhere(params: Record<string, string | undefined>) {
  const where: Prisma.DonationWhereInput = {};
  const status = params.status;
  const frequency = params.frequency;
  const origin = params.origin;
  const source = params.source;
  const q = params.q?.trim();

  if (status && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
    where.status = status as PaymentStatus;
  }

  if (
    frequency &&
    Object.values(DonationFrequency).includes(frequency as DonationFrequency)
  ) {
    where.frequency = frequency as DonationFrequency;
  }

  if (source && Object.values(DonationSource).includes(source as DonationSource)) {
    where.source = source as DonationSource;
  }

  if (origin === "MANUAL") {
    where.source = { not: DonationSource.ONLINE };
  }

  if (origin === PaymentProvider.STRIPE) {
    where.source = DonationSource.ONLINE;
    where.provider = PaymentProvider.STRIPE;
  }

  if (origin === PaymentProvider.NEDARIM_PLUS) {
    where.source = DonationSource.ONLINE;
    where.provider = PaymentProvider.NEDARIM_PLUS;
  }

  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
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
    orderBy: { updatedAt: "desc" },
    take: 250,
  });
}

function DonationDetailsDialog({ donation }: { donation: AdminDonation }) {
  const metadata = metadataObject(donation.metadata);
  const stripeUrl = stripePaymentUrl(donation);
  const stripeReceiptUrl = metadataText(donation.metadata, "stripeReceiptUrl");
  const cerfaUrl = fileUrl(donation.receipt?.fileKey);
  const isManual = donation.source !== DonationSource.ONLINE;
  const hasCerfa = canShowCerfaControls(donation);
  const receiptEmail = metadataText(donation.metadata, "receiptEmail") ?? "";

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="secondary" />}>
        <FileText className="size-4" />
        Détail
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{donation.donorName || donation.donorEmail}</DialogTitle>
          <DialogDescription>
            Don {donation.id} - créé le {dateTimeLabel(donation.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--subtle)]/70 p-3">
          <div className="grid gap-1 text-sm">
            <strong className="text-[var(--primary)]">Actions rapides</strong>
            <span className="text-[var(--muted)]">
              Reçu, Cerfa, historique du donateur et liens de paiement.
            </span>
          </div>
          <DonationActionsDropdown {...donationActionsProps(donation)} />
        </div>

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
              <CardTitle>{paymentStatusLabels[rowPaymentStatus(donation)]}</CardTitle>
              <CardDescription>{donationOriginLabel(donation)}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                {hasCerfa
                  ? isReceiptSent(donation)
                    ? "Cerfa envoyé"
                    : "Cerfa non envoyé"
                  : "Sans Cerfa"}
              </CardTitle>
              <CardDescription>
                {hasCerfa ? donation.receipt?.number ?? "Sans numéro" : "Non applicable"}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations donateur</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm md:grid-cols-2">
            <span>Email : {donation.donorEmail}</span>
            <span>Téléphone : {donation.donorPhone ?? "-"}</span>
            <span>Type : {metadataText(donation.metadata, "donorType") ?? "-"}</span>
            <span>Entreprise : {metadataText(donation.metadata, "companyName") ?? "-"}</span>
            <span>Type juridique : {metadataText(donation.metadata, "companyLegalForm") ?? "-"}</span>
            <span>Compte rattaché : {donation.user?.email ?? "Non"}</span>
            <span>Email d’envoi des reçus : {receiptEmail || donation.donorEmail}</span>
          </CardContent>
        </Card>

        {donation.dedication && (
          <Card>
            <CardHeader>
              <CardTitle>Dédicace</CardTitle>
              <CardDescription>{donation.dedication}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {donation.source === DonationSource.ONLINE && (
        <Card>
          <CardHeader>
            <CardTitle>Paiement en ligne</CardTitle>
            <CardDescription>
              {donationProviderLabels[donation.provider]}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {donation.provider === PaymentProvider.STRIPE ? (
              <>
                <span>Checkout: {donation.stripeCheckoutSessionId ?? "-"}</span>
                <span>Payment intent: {donation.stripePaymentIntentId ?? "-"}</span>
                <span>Subscription: {donation.stripeSubscriptionId ?? "-"}</span>
                <span>Customer: {donation.stripeCustomerId ?? "-"}</span>
              </>
            ) : (
              <span>
                Transaction:{" "}
                {String(
                  metadataNestedRecord(metadata, "nedarimPlus").transactionId ?? "-",
                )}
              </span>
            )}
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
                  Reçu Stripe
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
        )}

        {donation.payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
              <CardDescription>
                Suivi paiement par paiement, y compris les mensualités.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="table-wrap">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paiement</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reçu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donation.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-bold text-[var(--primary)]">
                          {installmentLabel(payment)}
                        </TableCell>
                        <TableCell>
                          {formatMoney(payment.amountCents, payment.currency)}
                        </TableCell>
                        <TableCell>
                          {payment.status === "REFUNDED" ||
                          payment.status === "PARTIALLY_REFUNDED" ? (
                            <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                              {paymentRowStatusLabel(payment.status)}
                            </span>
                          ) : (
                            <StatusBadge tone={donationTone(payment.status)}>
                              {paymentStatusLabels[payment.status]}
                            </StatusBadge>
                          )}
                          {payment.failureReason ? (
                            <p className="mt-1 text-xs text-red-700">
                              {payment.failureReason}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {dateTimeLabel(payment.paidAt ?? payment.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {payment.stripePaymentIntentId ? (
                              <Button asChild size="sm" variant="secondary">
                                <a
                                  href={`https://dashboard.stripe.com/test/payments/${payment.stripePaymentIntentId}`}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  <ExternalLink className="size-4" />
                                  Paiement
                                </a>
                              </Button>
                            ) : null}
                            {payment.stripeReceiptUrl ? (
                              <Button asChild size="sm" variant="secondary">
                                <a
                                  href={payment.stripeReceiptUrl}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  <ExternalLink className="size-4" />
                                  Reçu
                                </a>
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {cerfaUrl && (
          <Card>
            <CardHeader>
              <CardTitle>PDF Cerfa</CardTitle>
              <CardDescription>
                Reçu fiscal généré automatiquement et stocké sur le don.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <a href={cerfaUrl} rel="noreferrer" target="_blank">
                  <Download className="size-4" />
                  Télécharger le Cerfa PDF
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
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
                  placeholder="Note visible seulement par l’admin"
                />
                <Button type="submit" variant="secondary">
                  Enregistrer la note
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {isManual && (
          <form action={deleteManualDonation}>
            <input name="donationId" type="hidden" value={donation.id} />
            <Button type="submit" variant="destructive">
              <Trash2 className="size-4" />
              Supprimer le don manuel
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FilterBar({
  params,
}: {
  params: Record<string, string | undefined>;
}) {
  function frequencyHref(value: string) {
    const query = new URLSearchParams();

    for (const [key, rawValue] of Object.entries(params)) {
      if (!rawValue || key === "frequency") continue;
      query.set(key, rawValue);
    }

    if (value) {
      query.set("frequency", value);
    }

    const suffix = query.toString();

    return suffix ? `/admin/dons?${suffix}` : "/admin/dons";
  }

  const frequencyTabs = [
    { href: frequencyHref(""), label: "Tous", value: "" },
    {
      href: frequencyHref(DonationFrequency.ONE_TIME),
      label: "Ponctuels",
      value: DonationFrequency.ONE_TIME,
    },
    {
      href: frequencyHref(DonationFrequency.MONTHLY),
      label: "Récurrents",
      value: DonationFrequency.MONTHLY,
    },
  ];

  return (
    <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--subtle)]/70 p-3">
      <div className="flex gap-2 overflow-x-auto">
        {frequencyTabs.map((tab) => {
          const isActive = (params.frequency ?? "") === tab.value;

          return (
            <Link
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--primary)] transition data-[active=true]:border-[var(--accent)]/50 data-[active=true]:bg-[var(--accent-soft)] data-[active=true]:text-[var(--accent-strong)]"
              data-active={isActive}
              href={tab.href}
              key={tab.value || "all"}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <form className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_160px_170px_auto_auto]">
        {params.frequency ? (
          <input name="frequency" type="hidden" value={params.frequency} />
        ) : null}
        <InputGroup className="h-10 bg-white">
          <Search className="ml-3 size-4 text-[var(--muted)]" />
          <InputGroupInput
            defaultValue={params.q ?? ""}
            name="q"
            placeholder="Nom, email, téléphone, ID don, reçu, Stripe..."
          />
        </InputGroup>
        <NativeSelect defaultValue={params.status ?? ""} name="status">
          <NativeSelectOption value="">Statut</NativeSelectOption>
          {Object.values(PaymentStatus).map((status) => (
            <NativeSelectOption key={status} value={status}>
              {paymentStatusLabels[status]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect defaultValue={params.origin ?? ""} name="origin">
          <NativeSelectOption value="">Origine</NativeSelectOption>
          <NativeSelectOption value="MANUAL">Manuel</NativeSelectOption>
          <NativeSelectOption value={PaymentProvider.STRIPE}>Stripe</NativeSelectOption>
          <NativeSelectOption value={PaymentProvider.NEDARIM_PLUS}>
            Nedarim Plus
          </NativeSelectOption>
        </NativeSelect>
        <Button type="submit">
          <Search className="size-4" />
          Filtrer
        </Button>
        <Button asChild variant="secondary">
        <Link href="/admin/dons">Réinitialiser</Link>
        </Button>
      </form>
    </div>
  );
}

function ReceiptBulkDownloadCard() {
  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Téléchargement groupé des reçus</CardTitle>
        <CardDescription>
          Sélectionnez une plage de dates d’émission. Le ZIP contient un index
          CSV et un fichier PDF Cerfa par reçu.
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
            Télécharger les reçus
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
            <CardDescription>Total EUR réussi</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{pendingReceipts}</CardTitle>
            <CardDescription>Reçus Cerfa à créer</CardDescription>
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

      <Card className="mt-5">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Suivi des dons</CardTitle>
              <CardDescription>
                Paiements en ligne, dons manuels, Cerfa, remboursements, notes et
                recherche.
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
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Origine</TableHead>
                  <TableHead>Cerfa</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => {
                  const rowStatus = rowPaymentStatus(donation);
                  const recurringPayment = currentInstallmentLabel(donation);

                  return (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div className="grid gap-1">
                          <strong>{donation.donorName || donation.donorEmail}</strong>
                          <span className="text-sm text-[var(--muted)]">
                            {donation.donorEmail}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="grid gap-1">
                          <strong>
                            {formatMoney(donation.amountCents, donation.currency)}
                          </strong>
                          <span className="text-sm text-[var(--muted)]">
                            {donation.frequency === "MONTHLY"
                              ? `Mensuel ${recurringPayment ?? ""}`.trim()
                              : "Ponctuel"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge tone={donationTone(rowStatus)}>
                          {paymentStatusLabels[rowStatus]}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>{donationOriginLabel(donation)}</TableCell>
                      <TableCell>
                        {canShowCerfaControls(donation) ? (
                          <div className="grid gap-1">
                            <strong>{donation.receipt?.number ?? "À créer"}</strong>
                            <span className="text-sm text-[var(--muted)]">
                              {isReceiptSent(donation) ? "Envoyé" : "Non envoyé"}
                            </span>
                          </div>
                        ) : (
                          "Sans Cerfa"
                        )}
                      </TableCell>
                      <TableCell>{dateLabel(donation.paidAt ?? donation.createdAt)}</TableCell>
                      <TableCell>
                        <div className="admin-table-actions">
                          <DonationDetailsDialog donation={donation} />
                          <DonationActionsDropdown {...donationActionsProps(donation)} />
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
