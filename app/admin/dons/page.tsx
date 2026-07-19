import Link from "next/link";
import {
  CerfaReceiptType,
  DonationSource,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  ReceiptStatus,
} from "@prisma/client";
import {
  createManualDonation,
  deleteManualDonation,
  refundDonation,
  sendCerfaReceipt,
  sendPaymentReceipt,
  updateDonationDetails,
  updateDonationAdminNote,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
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
  Eye,
  ExternalLink,
  FileText,
  Mail,
  MoreHorizontal,
  RotateCcw,
  Search,
  Send,
  Trash2,
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
  const receipt = params.receipt;
  const origin = params.origin;
  const source = params.source;
  const q = params.q?.trim();

  if (status && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
    where.status = status as PaymentStatus;
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

  if (receipt && Object.values(ReceiptStatus).includes(receipt as ReceiptStatus)) {
    where.receiptStatus = receipt as ReceiptStatus;
  }

  if (receipt === "MISSING") {
    where.receiptNeeded = true;
    where.receipt = null;
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
            peut generer directement un recu Cerfa pour les dons eligibles.
          </DialogDescription>
        </DialogHeader>
        <form action={createManualDonation} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="firstName" placeholder="Prenom" />
            <Input name="lastName" placeholder="Nom" />
            <Input name="email" placeholder="Email" required type="email" />
            <Input name="phone" placeholder="Telephone" />
            <Input name="amount" placeholder="Montant" required type="number" />
            <NativeSelect defaultValue={PaymentStatus.PAID} name="status">
              {Object.values(PaymentStatus).map((status) => (
                <NativeSelectOption key={status} value={status}>
                  {paymentStatusLabels[status]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
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
            <Input name="paidAt" placeholder="Date du don" type="date" />
            <Input name="paymentReference" placeholder="Reference cheque/virement" />
            <NativeSelect defaultValue="PARTICULIER" name="donorType">
              <NativeSelectOption value="PARTICULIER">Particulier</NativeSelectOption>
              <NativeSelectOption value="ENTREPRISE">Entreprise</NativeSelectOption>
            </NativeSelect>
          </div>
          <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-3 sm:grid-cols-3">
            <Input name="companyName" placeholder="Societe (si entreprise)" />
            <Input name="companyLegalForm" placeholder="Forme juridique" />
            <Input name="receiptTaxId" placeholder="SIREN / SIRET" />
          </div>
          <Textarea name="dedication" placeholder="Dedicace ou note" />
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
              name="receiptEmail"
              placeholder="Email d'envoi des recus (si different)"
              type="email"
            />
            <Input
              className="sm:col-span-2"
              name="receiptAddress"
              placeholder="Adresse"
            />
            <Input name="receiptZip" placeholder="Code postal" />
            <Input name="receiptCity" placeholder="Ville" />
            <Input defaultValue="France" name="receiptCountry" placeholder="Pays" />
          </div>
          <Textarea name="adminNote" placeholder="Note interne" />
          <div className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-3">
            <strong className="text-sm text-[var(--primary)]">
              Envois automatiques si le don est paye
            </strong>
            <label className="flex items-center gap-2 text-sm font-bold text-[var(--primary)]">
              <input name="sendPaymentReceipt" type="checkbox" />
              Envoyer automatiquement le recu / mail de remerciement
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-[var(--primary)]">
              <input name="sendCerfaReceipt" type="checkbox" />
              Envoyer automatiquement le recu Cerfa
            </label>
          </div>
          <Button type="submit">Creer le don</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DonationDetailsDialog({ donation }: { donation: AdminDonation }) {
  const metadata = metadataObject(donation.metadata);
  const stripeUrl = stripePaymentUrl(donation);
  const stripeReceiptUrl = metadataText(donation.metadata, "stripeReceiptUrl");
  const cerfaUrl = fileUrl(donation.receipt?.fileKey);
  const isManual = donation.source !== DonationSource.ONLINE;
  const hasCerfa = canShowCerfaControls(donation);
  const receiptEmail = metadataText(donation.metadata, "receiptEmail") ?? "";
  const receiptAddress = metadataNestedText(donation.metadata, "receipt", "address");
  const receiptZip = metadataNestedText(donation.metadata, "receipt", "zip");
  const receiptCity = metadataNestedText(donation.metadata, "receipt", "city");
  const receiptCountry =
    metadataNestedText(donation.metadata, "receipt", "country") ?? "France";
  const receiptTaxId = metadataNestedText(donation.metadata, "receipt", "taxId");

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

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--subtle)]/70 p-3">
          <div className="grid gap-1 text-sm">
            <strong className="text-[var(--primary)]">Actions rapides</strong>
            <span className="text-[var(--muted)]">
              Recu, Cerfa, historique du donateur et liens paiement.
            </span>
          </div>
          <DonationActionsDropdown donation={donation} />
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
                    ? "Cerfa envoye"
                    : "Cerfa non envoye"
                  : "Sans Cerfa"}
              </CardTitle>
              <CardDescription>
                {hasCerfa ? donation.receipt?.number ?? "Sans numero" : "Non applicable"}
              </CardDescription>
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
            <span>Type juridique: {metadataText(donation.metadata, "companyLegalForm") ?? "-"}</span>
            <span>Compte rattache: {donation.user?.email ?? "Non"}</span>
            <span>Email d&apos;envoi recus: {receiptEmail || donation.donorEmail}</span>
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
                  Recu Stripe
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
                Suivi paiement par paiement, y compris les mensualites.
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
                      <TableHead>Recu</TableHead>
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
                                  Recu
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

        <Card>
          <CardHeader>
            <CardTitle>
              {isManual
                ? "Modifier le don manuel"
                : hasCerfa
                  ? "Modifier les donnees fiscales"
                  : "Modifier les donnees du don"}
            </CardTitle>
            <CardDescription>
              {isManual
                ? "Tous les champs du don manuel peuvent etre ajustes."
                : hasCerfa
                  ? "Le montant et les donnees du paiement en ligne restent verrouilles."
                  : "Le montant et les donnees du paiement en ligne restent verrouilles. Aucun Cerfa n'est genere pour ce don."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateDonationDetails} className="grid gap-3">
              <input name="donationId" type="hidden" value={donation.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  defaultValue={donation.donorFirstName ?? ""}
                  disabled={!isManual}
                  name="firstName"
                  placeholder="Prenom"
                />
                <Input
                  defaultValue={donation.donorLastName ?? ""}
                  disabled={!isManual}
                  name="lastName"
                  placeholder="Nom"
                />
                <Input
                  defaultValue={donation.donorPhone ?? ""}
                  disabled={!isManual}
                  name="phone"
                  placeholder="Telephone"
                />
                <Input
                  defaultValue={receiptEmail}
                  name="receiptEmail"
                  placeholder="Email d'envoi des recus"
                  type="email"
                />
                {isManual && (
                  <>
                    <Input
                      defaultValue={donation.amountCents / 100}
                      name="amount"
                      placeholder="Montant"
                      type="number"
                    />
                    <NativeSelect defaultValue={donation.currency} name="currency">
                      <NativeSelectOption value="EUR">EUR</NativeSelectOption>
                      <NativeSelectOption value="USD">USD</NativeSelectOption>
                      <NativeSelectOption value="ILS">ILS</NativeSelectOption>
                    </NativeSelect>
                    <NativeSelect defaultValue={donation.status} name="status">
                      {Object.values(PaymentStatus).map((status) => (
                        <NativeSelectOption key={status} value={status}>
                          {paymentStatusLabels[status]}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <NativeSelect defaultValue={donation.source} name="source">
                      {Object.values(DonationSource)
                        .filter((source) => source !== DonationSource.ONLINE)
                        .map((source) => (
                          <NativeSelectOption key={source} value={source}>
                            {donationSourceLabels[source]}
                          </NativeSelectOption>
                        ))}
                    </NativeSelect>
                    <Input
                      defaultValue={
                        donation.paidAt
                          ? donation.paidAt.toISOString().slice(0, 10)
                          : ""
                      }
                      name="paidAt"
                      type="date"
                    />
                  </>
                )}
                <NativeSelect
                  defaultValue={
                    metadataText(donation.metadata, "donorType") === "ENTREPRISE"
                      ? "ENTREPRISE"
                      : "PARTICULIER"
                  }
                  name="donorType"
                >
                  <NativeSelectOption value="PARTICULIER">Particulier</NativeSelectOption>
                  <NativeSelectOption value="ENTREPRISE">Entreprise</NativeSelectOption>
                </NativeSelect>
                {hasCerfa ? (
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
                ) : null}
                <Input
                  defaultValue={metadataText(donation.metadata, "companyName") ?? ""}
                  name="companyName"
                  placeholder="Societe (entreprise)"
                />
                <Input
                  defaultValue={
                    metadataText(donation.metadata, "companyLegalForm") ?? ""
                  }
                  name="companyLegalForm"
                  placeholder="Forme juridique"
                />
                <Input
                  defaultValue={receiptTaxId ?? donation.receipt?.donorTaxId ?? ""}
                  name="receiptTaxId"
                  placeholder="SIREN / SIRET"
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
                  defaultValue={receiptAddress ?? donation.receipt?.donorAddress ?? ""}
                  name="receiptAddress"
                  placeholder="Adresse fiscale"
                />
                <Input
                  defaultValue={receiptZip ?? donation.receipt?.donorZip ?? ""}
                  name="receiptZip"
                  placeholder="Code postal"
                />
                <Input
                  defaultValue={receiptCity ?? donation.receipt?.donorCity ?? ""}
                  name="receiptCity"
                  placeholder="Ville"
                />
                <Input
                  defaultValue={receiptCountry}
                  name="receiptCountry"
                  placeholder="Pays"
                />
              </div>
              <Textarea
                defaultValue={donation.dedication ?? ""}
                disabled={!isManual}
                name="dedication"
                placeholder="Dedicace"
              />
              <Textarea
                defaultValue={
                  typeof metadata.adminNote === "string" ? metadata.adminNote : ""
                }
                name="adminNote"
                placeholder="Note interne"
              />
              <Button type="submit">
                {hasCerfa ? "Enregistrer et mettre a jour le Cerfa" : "Enregistrer"}
              </Button>
            </form>
          </CardContent>
        </Card>

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

function DonationActionsDropdown({ donation }: { donation: AdminDonation }) {
  const hasCerfa = canShowCerfaControls(donation);
  const cerfaUrl = fileUrl(donation.receipt?.fileKey);
  const stripeReceiptUrl = metadataText(donation.metadata, "stripeReceiptUrl");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="sm" variant="secondary" />}>
        <MoreHorizontal className="size-4" />
        Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Don</DropdownMenuLabel>
        <DropdownMenuItem render={<Link href={`/admin/dons?q=${encodeURIComponent(donation.donorEmail)}`} />}>
          <Eye className="size-4" />
          Voir les dons du donateur
        </DropdownMenuItem>
        {stripeReceiptUrl ? (
          <DropdownMenuItem render={<a href={stripeReceiptUrl} rel="noreferrer" target="_blank" />}>
            <ExternalLink className="size-4" />
            Voir le recu Stripe
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem render={<form action={sendPaymentReceipt} />}>
          <input name="donationId" type="hidden" value={donation.id} />
          <button className="flex w-full items-center gap-2" type="submit">
            <Mail className="size-4" />
            Envoyer le recu
          </button>
        </DropdownMenuItem>
        {hasCerfa ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Cerfa</DropdownMenuLabel>
            <DropdownMenuItem render={<form action={sendCerfaReceipt} />}>
              <input name="donationId" type="hidden" value={donation.id} />
              <button className="flex w-full items-center gap-2" type="submit">
                <Send className="size-4" />
                Envoyer le Cerfa
              </button>
            </DropdownMenuItem>
            {cerfaUrl ? (
              <>
                <DropdownMenuItem render={<a href={cerfaUrl} rel="noreferrer" target="_blank" />}>
                  <Eye className="size-4" />
                  Voir le Cerfa
                </DropdownMenuItem>
                <DropdownMenuItem render={<a download href={cerfaUrl} />}>
                  <Download className="size-4" />
                  Telecharger le Cerfa
                </DropdownMenuItem>
              </>
            ) : null}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterBar({
  params,
}: {
  params: Record<string, string | undefined>;
}) {
  return (
    <form className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--subtle)]/70 p-3 lg:grid-cols-[minmax(260px,1fr)_150px_160px_170px_auto_auto]">
      <InputGroup className="h-10 bg-white">
        <Search className="ml-3 size-4 text-[var(--muted)]" />
        <InputGroupInput
          defaultValue={params.q ?? ""}
          name="q"
          placeholder="Nom, email, telephone, recu, Stripe..."
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
      <NativeSelect defaultValue={params.receipt ?? ""} name="receipt">
        <NativeSelectOption value="">Recu / Cerfa</NativeSelectOption>
        <NativeSelectOption value="MISSING">Cerfa a creer</NativeSelectOption>
        {Object.values(ReceiptStatus).map((status) => (
          <NativeSelectOption key={status} value={status}>
            {receiptStatusLabels[status]}
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
        <Link href="/admin/dons">Reset</Link>
      </Button>
    </form>
  );
}

function ReceiptBulkDownloadCard() {
  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Telechargement groupe des recus</CardTitle>
        <CardDescription>
          Selectionnez une plage de dates d&apos;emission. Le ZIP contient un index
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
              {donations.length} resultat(s)
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
                            <strong>{donation.receipt?.number ?? "A creer"}</strong>
                            <span className="text-sm text-[var(--muted)]">
                              {isReceiptSent(donation) ? "Envoye" : "Non envoye"}
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
                          <DonationActionsDropdown donation={donation} />
                          <RefundDialog donation={donation} />
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
