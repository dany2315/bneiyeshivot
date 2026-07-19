"use client";

import { useState } from "react";
import { Banknote } from "lucide-react";
import { createManualDonation } from "../actions";
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
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

const paymentStatuses = [
  { label: "Reussi", value: "PAID" },
  { label: "En attente", value: "PENDING" },
  { label: "Echoue", value: "FAILED" },
  { label: "Rembourse", value: "REFUNDED" },
  { label: "Partiellement rembourse", value: "PARTIALLY_REFUNDED" },
  { label: "Annule", value: "CANCELED" },
];

const donationSources = [
  { label: "Especes", value: "ADMIN_CASH" },
  { label: "Cheque", value: "ADMIN_CHECK" },
  { label: "Virement", value: "ADMIN_TRANSFER" },
  { label: "Autre manuel", value: "ADMIN_OTHER" },
];

export function ManualDonationDialog() {
  const [donorType, setDonorType] = useState<"PARTICULIER" | "ENTREPRISE">(
    "PARTICULIER",
  );
  const receiptType = donorType === "ENTREPRISE" ? "ENTREPRISE" : "PARTICULIER";

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
            Especes, cheque, virement ou autre. Le Cerfa est choisi
            automatiquement selon le type de donateur.
          </DialogDescription>
        </DialogHeader>
        <form action={createManualDonation} className="grid gap-3">
          <input name="receiptType" type="hidden" value={receiptType} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="firstName" placeholder="Prenom" />
            <Input name="lastName" placeholder="Nom" />
            <Input name="email" placeholder="Email" required type="email" />
            <Input name="phone" placeholder="Telephone" />
            <Input name="amount" placeholder="Montant" required type="number" />
            <NativeSelect className="w-full" defaultValue="PAID" name="status">
              {paymentStatuses.map((status) => (
                <NativeSelectOption key={status.value} value={status.value}>
                  {status.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect className="w-full" defaultValue="EUR" name="currency">
              <NativeSelectOption value="EUR">EUR</NativeSelectOption>
              <NativeSelectOption value="USD">USD</NativeSelectOption>
              <NativeSelectOption value="ILS">ILS</NativeSelectOption>
            </NativeSelect>
            <NativeSelect
              className="w-full"
              defaultValue="ADMIN_CASH"
              name="source"
            >
              {donationSources.map((source) => (
                <NativeSelectOption key={source.value} value={source.value}>
                  {source.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Input name="paidAt" placeholder="Date du don" type="date" />
            <Input name="paymentReference" placeholder="Reference cheque/virement" />
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
          </div>

          {donorType === "ENTREPRISE" ? (
            <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-3 sm:grid-cols-3">
              <Input name="companyName" placeholder="Societe" />
              <Input name="companyLegalForm" placeholder="Forme juridique" />
              <Input name="receiptTaxId" placeholder="SIREN / SIRET" />
            </div>
          ) : null}

          <Textarea name="dedication" placeholder="Dedicace ou note" />
          <div className="grid gap-3 sm:grid-cols-2">
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
              placeholder="Adresse fiscale"
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
