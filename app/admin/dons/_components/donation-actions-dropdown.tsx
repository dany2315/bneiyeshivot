"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Download,
  Edit3,
  ExternalLink,
  Eye,
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
  const receiptType = donorType === "ENTREPRISE" ? "ENTREPRISE" : "PARTICULIER";

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
              onClick={() => setFiscalOpen(true)}
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

      <Dialog open={fiscalOpen} onOpenChange={setFiscalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier les donnees fiscales</DialogTitle>
            <DialogDescription>
              Ces donnees servent au Cerfa. Le montant et le paiement restent
              inchanges.
            </DialogDescription>
          </DialogHeader>
          <form action={updateDonationDetails} className="grid gap-3">
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
            <div className="flex flex-wrap gap-2">
              <Button type="submit">
                Enregistrer et mettre a jour le Cerfa
              </Button>
            </div>
          </form>
          {hasCerfa ? (
            <form action={sendCerfaReceipt} className="border-t border-[var(--border)] pt-3">
              <input name="donationId" type="hidden" value={donationId} />
              <Button type="submit" variant="secondary">
                <Send className="size-4" />
                Envoyer le Cerfa
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
