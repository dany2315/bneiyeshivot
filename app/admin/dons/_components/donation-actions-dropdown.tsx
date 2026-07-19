"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  Loader2,
  Mail,
  MoreHorizontal,
  RotateCcw,
  Send,
} from "lucide-react";
import {
  refundDonation,
  sendCerfaReceipt,
  sendPaymentReceipt,
  updateDonationDetails,
} from "../actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

type FiscalDefaults = {
  adminNote: string;
  amount: string;
  companyLegalForm: string;
  companyName: string;
  currency: string;
  dedication: string;
  donorType: "PARTICULIER" | "ENTREPRISE";
  firstName: string;
  lastName: string;
  paidAt: string;
  phone: string;
  receiptAddress: string;
  receiptCity: string;
  receiptCountry: string;
  receiptDonorName: string;
  receiptEmail: string;
  receiptTaxId: string;
  receiptZip: string;
  source: string;
  status: string;
};

const actionItemClassName =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-[var(--primary)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]";

export function DonationActionsDropdown({
  canEditFiscal,
  canRefund,
  cerfaUrl,
  donationId,
  donorEmail,
  fiscalDefaults,
  hasCerfa,
  refundableAmountLabel,
  stripeReceiptUrl,
}: {
  canEditFiscal: boolean;
  canRefund: boolean;
  cerfaUrl: string | null;
  donationId: string;
  donorEmail: string;
  fiscalDefaults: FiscalDefaults;
  hasCerfa: boolean;
  refundableAmountLabel: string | null;
  stripeReceiptUrl: string | null;
}) {
  const [refundOpen, setRefundOpen] = useState(false);
  const [fiscalOpen, setFiscalOpen] = useState(false);
  const [donorType, setDonorType] = useState(fiscalDefaults.donorType);
  const [fiscalError, setFiscalError] = useState<string | null>(null);
  const [fiscalUpdated, setFiscalUpdated] = useState(false);
  const [isSendingCerfa, setIsSendingCerfa] = useState(false);
  const [isUpdatingFiscal, setIsUpdatingFiscal] = useState(false);
  const [sentCerfa, setSentCerfa] = useState(false);
  const receiptType = donorType === "ENTREPRISE" ? "ENTREPRISE" : "PARTICULIER";

  function openFiscalDialog() {
    setFiscalError(null);
    setFiscalUpdated(false);
    setSentCerfa(false);
    setFiscalOpen(true);
  }

  async function handleFiscalSubmit(formData: FormData) {
    setFiscalError(null);
    setFiscalUpdated(false);
    setSentCerfa(false);
    setIsUpdatingFiscal(true);

    try {
      await updateDonationDetails(formData);
      setFiscalUpdated(true);
    } catch (error) {
      setFiscalError(
        error instanceof Error
          ? error.message
          : "Impossible de mettre a jour les donnees fiscales.",
      );
    } finally {
      setIsUpdatingFiscal(false);
    }
  }

  async function handleSendCerfa() {
    const formData = new FormData();
    formData.set("donationId", donationId);
    setFiscalError(null);
    setIsSendingCerfa(true);

    try {
      await sendCerfaReceipt(formData);
      setSentCerfa(true);
    } catch (error) {
      setFiscalError(
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer le Cerfa.",
      );
    } finally {
      setIsSendingCerfa(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" variant="secondary" />}>
          <MoreHorizontal className="size-4" />
          Actions
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <div className="px-2 py-1 text-xs font-bold text-[var(--muted)]">Don</div>
          <Link
            className={actionItemClassName}
            href={`/admin/dons?q=${encodeURIComponent(donorEmail)}`}
          >
            <Eye className="size-4" />
            Voir les dons du donateur
          </Link>
          {stripeReceiptUrl ? (
            <a
              className={actionItemClassName}
              href={stripeReceiptUrl}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-4" />
              Voir le recu Stripe
            </a>
          ) : null}
          <form action={sendPaymentReceipt}>
            <input name="donationId" type="hidden" value={donationId} />
            <button className={actionItemClassName} type="submit">
              <Mail className="size-4" />
              Envoyer le recu
            </button>
          </form>
          {canRefund ? (
            <button
              className={`${actionItemClassName} text-red-700 hover:bg-red-50 hover:text-red-800`}
              onClick={() => setRefundOpen(true)}
              type="button"
            >
              <RotateCcw className="size-4" />
              Rembourser
            </button>
          ) : null}
          {canEditFiscal ? (
            <button
              className={actionItemClassName}
              onClick={openFiscalDialog}
              type="button"
            >
              <Edit3 className="size-4" />
              Modifier les donnees fiscales
            </button>
          ) : null}
          {hasCerfa ? (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1 text-xs font-bold text-[var(--muted)]">
                Cerfa
              </div>
              <form action={sendCerfaReceipt}>
                <input name="donationId" type="hidden" value={donationId} />
                <button className={actionItemClassName} type="submit">
                  <Send className="size-4" />
                  Envoyer le Cerfa
                </button>
              </form>
              {cerfaUrl ? (
                <>
                  <a
                    className={actionItemClassName}
                    href={cerfaUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Eye className="size-4" />
                    Voir le Cerfa
                  </a>
                  <a className={actionItemClassName} download href={cerfaUrl}>
                    <Download className="size-4" />
                    Telecharger le Cerfa
                  </a>
                </>
              ) : null}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rembourser le don</DialogTitle>
            <DialogDescription>
              Solde remboursable: {refundableAmountLabel ?? "-"}.
              Laisser vide pour rembourser le solde complet.
            </DialogDescription>
          </DialogHeader>
          <form action={refundDonation} className="grid gap-3">
            <input name="donationId" type="hidden" value={donationId} />
            <Input name="refundAmount" placeholder="Montant a rembourser" type="number" />
            <Button type="submit" variant="destructive">
              Rembourser via Stripe
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={fiscalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFiscalError(null);
            setFiscalUpdated(false);
            setSentCerfa(false);
          }
          setFiscalOpen(open);
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier les donnees fiscales</DialogTitle>
            <DialogDescription>
              Ces donnees servent au Cerfa. Le montant et le paiement restent
              inchanges.
            </DialogDescription>
          </DialogHeader>
          <form action={handleFiscalSubmit} className="grid gap-3">
            <input name="donationId" type="hidden" value={donationId} />
            <input name="receiptType" type="hidden" value={receiptType} />
            <input name="firstName" type="hidden" value={fiscalDefaults.firstName} />
            <input name="lastName" type="hidden" value={fiscalDefaults.lastName} />
            <input name="phone" type="hidden" value={fiscalDefaults.phone} />
            <input name="amount" type="hidden" value={fiscalDefaults.amount} />
            <input name="currency" type="hidden" value={fiscalDefaults.currency} />
            <input name="status" type="hidden" value={fiscalDefaults.status} />
            <input name="source" type="hidden" value={fiscalDefaults.source} />
            <input name="paidAt" type="hidden" value={fiscalDefaults.paidAt} />
            <input name="dedication" type="hidden" value={fiscalDefaults.dedication} />
            <input name="adminNote" type="hidden" value={fiscalDefaults.adminNote} />

            <div className="grid gap-3 sm:grid-cols-2">
              <NativeSelect
                className="w-full"
                name="donorType"
                onChange={(event) =>
                  setDonorType(
                    event.target.value === "ENTREPRISE"
                      ? "ENTREPRISE"
                      : "PARTICULIER",
                  )
                }
                value={donorType}
              >
                <NativeSelectOption value="PARTICULIER">Particulier</NativeSelectOption>
                <NativeSelectOption value="ENTREPRISE">Entreprise</NativeSelectOption>
              </NativeSelect>
              <Input
                defaultValue={fiscalDefaults.receiptEmail}
                name="receiptEmail"
                placeholder="Email d'envoi des recus"
                type="email"
              />
              {donorType === "ENTREPRISE" ? (
                <>
                  <Input
                    defaultValue={fiscalDefaults.companyName}
                    name="companyName"
                    placeholder="Societe"
                  />
                  <Input
                    defaultValue={fiscalDefaults.companyLegalForm}
                    name="companyLegalForm"
                    placeholder="Forme juridique"
                  />
                  <Input
                    defaultValue={fiscalDefaults.receiptTaxId}
                    name="receiptTaxId"
                    placeholder="SIREN / SIRET"
                  />
                </>
              ) : null}
              <Input
                className="sm:col-span-2"
                defaultValue={fiscalDefaults.receiptDonorName}
                name="receiptDonorName"
                placeholder="Nom sur le recu"
              />
              <Input
                className="sm:col-span-2"
                defaultValue={fiscalDefaults.receiptAddress}
                name="receiptAddress"
                placeholder="Adresse fiscale"
              />
              <Input
                defaultValue={fiscalDefaults.receiptZip}
                name="receiptZip"
                placeholder="Code postal"
              />
              <Input
                defaultValue={fiscalDefaults.receiptCity}
                name="receiptCity"
                placeholder="Ville"
              />
              <Input
                defaultValue={fiscalDefaults.receiptCountry}
                name="receiptCountry"
                placeholder="Pays"
              />
            </div>
            {fiscalError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                {fiscalError}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <Button disabled={isUpdatingFiscal} type="submit">
                {isUpdatingFiscal ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {isUpdatingFiscal
                  ? "Mise a jour..."
                  : "Enregistrer et mettre a jour le Cerfa"}
              </Button>
              {fiscalUpdated ? (
                <span className="inline-flex animate-in fade-in-0 zoom-in-95 items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-700">
                  <CheckCircle2 className="size-4" />
                  Donnees fiscales mises a jour
                </span>
              ) : null}
            </div>
          </form>
          {hasCerfa && fiscalUpdated ? (
            <div className="grid animate-in fade-in-0 slide-in-from-bottom-2 gap-3 rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-3">
              <div className="grid gap-1">
                <strong className="text-sm text-[var(--primary)]">
                  Envoyer le Cerfa maintenant ?
                </strong>
                <span className="text-sm text-[var(--muted)]">
                  Le PDF a ete regenere avec les nouvelles donnees fiscales.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  disabled={isSendingCerfa || sentCerfa}
                  onClick={handleSendCerfa}
                  type="button"
                  variant="secondary"
                >
                  {isSendingCerfa ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {sentCerfa
                    ? "Cerfa envoye"
                    : isSendingCerfa
                      ? "Envoi..."
                      : "Envoyer le Cerfa"}
                </Button>
                {sentCerfa ? (
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-green-700">
                    <CheckCircle2 className="size-4" />
                    Envoi effectue
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
