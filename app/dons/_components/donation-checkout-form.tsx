"use client";

import { useMemo, useState } from "react";
import {
  BadgeEuro,
  Building2,
  CheckCircle2,
  Gift,
  HeartHandshake,
  Mail,
  ReceiptText,
  Repeat2,
  ShieldCheck,
  User,
} from "lucide-react";
import { donationAmountOptions } from "@/lib/donations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const campaigns = [
  {
    value: "general",
    label: "Fonds general",
    description: "La ou le besoin est le plus urgent.",
  },
  {
    value: "torah",
    label: "Torah et mivhanim",
    description: "Programmes d'etude, recompenses et suivi.",
  },
  {
    value: "assistance",
    label: "Aide administrative",
    description: "Visa, koupat holim, urgence et accompagnement.",
  },
  {
    value: "events",
    label: "Evenements",
    description: "Chabbat, rencontres et lien communautaire.",
  },
];

const impactByAmount = [
  { min: 20, label: "Un dossier accompagne" },
  { min: 50, label: "Une aide administrative concrete" },
  { min: 100, label: "Un soutien terrain renforce" },
  { min: 180, label: "Un programme Torah soutenu" },
  { min: 260, label: "Un jeune suivi sur plusieurs etapes" },
  { min: 500, label: "Un vrai levier pour une action collective" },
];

function moneyLabel(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function amountImpact(amount: number) {
  return [...impactByAmount].reverse().find((item) => amount >= item.min)?.label;
}

export function DonationCheckoutForm() {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [frequency, setFrequency] = useState<"ONE_TIME" | "MONTHLY">("ONE_TIME");
  const [campaign, setCampaign] = useState("general");
  const [receiptNeeded, setReceiptNeeded] = useState(false);
  const [donorType, setDonorType] = useState<"PARTICULIER" | "ENTREPRISE">(
    "PARTICULIER",
  );
  const [anonymous, setAnonymous] = useState(false);
  const [newsletter, setNewsletter] = useState(true);

  const effectiveAmount = useMemo(() => {
    const custom = Number(customAmount.replace(",", "."));

    if (Number.isFinite(custom) && custom > 0) {
      return custom;
    }

    return selectedAmount;
  }, [customAmount, selectedAmount]);

  const selectedCampaign = campaigns.find((item) => item.value === campaign);
  const providerLabel =
    currency === "ILS"
      ? "Stripe test pour ILS, Nedarim Plus pourra etre branche ensuite"
      : "Stripe";

  return (
    <Card
      id="don-form"
      className="overflow-hidden border-[var(--border)] bg-white/95 shadow-[0_24px_70px_rgba(6,40,70,0.08)]"
    >
      <CardHeader className="border-b border-[var(--border)] bg-[var(--subtle)]/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
              <BadgeEuro className="size-5" />
            </span>
            <div>
              <CardTitle className="text-2xl">Finaliser mon don</CardTitle>
              <CardDescription>
                Montant, affectation, coordonnees, Cerfa et paiement securise.
              </CardDescription>
            </div>
          </div>
          <Badge variant="info" className="gap-2 px-3 py-2">
            <ShieldCheck className="size-4" />
            {providerLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        <form action="/api/dons/checkout" className="grid gap-7" method="post">
          <input name="amount" type="hidden" value={selectedAmount} />
          <input name="campaign" type="hidden" value={campaign} />
          <input name="donorType" type="hidden" value={donorType} />
          <input name="anonymous" type="hidden" value={String(anonymous)} />
          <input name="newsletter" type="hidden" value={String(newsletter)} />

          <section className="grid gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[var(--primary)]">
                  1. Montant du don
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  Choisissez une proposition ou entrez un montant libre.
                </p>
              </div>
              <Badge variant="warning" className="px-3 py-2">
                {moneyLabel(effectiveAmount, currency)}
                {frequency === "MONTHLY" ? " / mois" : ""}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {donationAmountOptions.map((amount) => (
                <button
                  className="grid min-h-24 place-items-center rounded-xl border border-[var(--border)] bg-white font-serif text-3xl font-bold text-[var(--primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-md data-[selected=true]:border-[var(--accent)]/50 data-[selected=true]:bg-[var(--accent-soft)] data-[selected=true]:text-[var(--accent-strong)]"
                  data-selected={customAmount === "" && selectedAmount === amount}
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                  }}
                  type="button"
                >
                  {amount} EUR
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <Label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--primary)]">
                  Montant libre
                </span>
                <InputGroup className="h-12 bg-white">
                  <InputGroupInput
                    min="1"
                    name="customAmount"
                    onChange={(event) => setCustomAmount(event.target.value)}
                    placeholder="Autre montant"
                    step="0.01"
                    type="number"
                    value={customAmount}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>{currency}</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Label>

              <Label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--primary)]">
                  Devise
                </span>
                <NativeSelect
                  className="w-full"
                  name="currency"
                  onChange={(event) => setCurrency(event.target.value)}
                  value={currency}
                >
                  <NativeSelectOption value="EUR">EUR</NativeSelectOption>
                  <NativeSelectOption value="USD">USD</NativeSelectOption>
                  <NativeSelectOption value="ILS">ILS</NativeSelectOption>
                </NativeSelect>
              </Label>
            </div>
          </section>

          <Separator />

          <section className="grid gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--primary)]">
                2. Type de soutien
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Le don recurrent cree un paiement mensuel Stripe.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="flex min-h-16 items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 text-left transition data-[selected=true]:border-[var(--accent)]/50 data-[selected=true]:bg-[var(--accent-soft)]"
                data-selected={frequency === "ONE_TIME"}
                onClick={() => setFrequency("ONE_TIME")}
                type="button"
              >
                <Gift className="size-5 text-[var(--accent)]" />
                <span className="grid">
                  <strong className="text-[var(--primary)]">Don ponctuel</strong>
                  <small className="text-[var(--muted)]">Une seule fois</small>
                </span>
              </button>
              <button
                className="flex min-h-16 items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 text-left transition data-[selected=true]:border-[var(--accent)]/50 data-[selected=true]:bg-[var(--accent-soft)]"
                data-selected={frequency === "MONTHLY"}
                onClick={() => setFrequency("MONTHLY")}
                type="button"
              >
                <Repeat2 className="size-5 text-[var(--accent)]" />
                <span className="grid">
                  <strong className="text-[var(--primary)]">Don mensuel</strong>
                  <small className="text-[var(--muted)]">Prelevement recurrent</small>
                </span>
              </button>
            </div>
            <input name="frequency" type="hidden" value={frequency} />
          </section>

          <Separator />

          <section className="grid gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--primary)]">
                3. Affectation du don
              </h2>
              <p className="text-sm text-[var(--muted)]">
                L'admin verra cette indication dans la fiche du don.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {campaigns.map((item) => (
                <button
                  className="grid gap-1 rounded-xl border border-[var(--border)] bg-white p-4 text-left transition hover:border-[var(--accent)]/40 data-[selected=true]:border-[var(--accent)]/50 data-[selected=true]:bg-[var(--accent-soft)]"
                  data-selected={campaign === item.value}
                  key={item.value}
                  onClick={() => setCampaign(item.value)}
                  type="button"
                >
                  <strong className="text-[var(--primary)]">{item.label}</strong>
                  <span className="text-sm text-[var(--muted)]">
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <Separator />

          <section className="grid gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--primary)]">
                4. Donateur
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Ces informations servent au paiement, au rattachement compte et
                au recu.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="flex min-h-14 items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 text-left transition data-[selected=true]:border-[var(--accent)]/50 data-[selected=true]:bg-[var(--accent-soft)]"
                data-selected={donorType === "PARTICULIER"}
                onClick={() => setDonorType("PARTICULIER")}
                type="button"
              >
                <User className="size-5 text-[var(--accent)]" />
                <strong className="text-[var(--primary)]">Particulier</strong>
              </button>
              <button
                className="flex min-h-14 items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 text-left transition data-[selected=true]:border-[var(--accent)]/50 data-[selected=true]:bg-[var(--accent-soft)]"
                data-selected={donorType === "ENTREPRISE"}
                onClick={() => setDonorType("ENTREPRISE")}
                type="button"
              >
                <Building2 className="size-5 text-[var(--accent)]" />
                <strong className="text-[var(--primary)]">Entreprise</strong>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--primary)]">
                  Prenom
                </span>
                <Input name="firstName" required />
              </Label>
              <Label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--primary)]">
                  Nom
                </span>
                <Input name="lastName" required />
              </Label>
              <Label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--primary)]">
                  Email
                </span>
                <Input name="email" required type="email" />
              </Label>
              <Label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--primary)]">
                  Telephone
                </span>
                <Input name="phone" type="tel" />
              </Label>
              {donorType === "ENTREPRISE" && (
                <Label className="grid gap-2 sm:col-span-2">
                  <span className="text-sm font-bold text-[var(--primary)]">
                    Nom de l'entreprise
                  </span>
                  <Input name="companyName" />
                </Label>
              )}
            </div>

            <Label className="grid gap-2">
              <span className="text-sm font-bold text-[var(--primary)]">
                Dedicace ou message
              </span>
              <Textarea
                name="dedication"
                placeholder="Pour une refoua, une reussite, a la memoire de..."
              />
            </Label>

            <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--subtle)]/60 p-4">
              <label className="flex items-center justify-between gap-4">
                <span className="grid">
                  <strong className="text-sm text-[var(--primary)]">
                    Don anonyme cote public
                  </strong>
                  <small className="text-[var(--muted)]">
                    L'admin garde les informations pour le suivi.
                  </small>
                </span>
                <Switch
                  checked={anonymous}
                  onCheckedChange={setAnonymous}
                />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span className="grid">
                  <strong className="text-sm text-[var(--primary)]">
                    Recevoir les nouvelles de l'association
                  </strong>
                  <small className="text-[var(--muted)]">
                    Utile pour remercier et donner des nouvelles.
                  </small>
                </span>
                <Switch
                  checked={newsletter}
                  onCheckedChange={setNewsletter}
                />
              </label>
            </div>
          </section>

          <Separator />

          <section className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[var(--primary)]">
                  5. Recu Cerfa
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  Les informations sont rattachees au don dans l'admin.
                </p>
              </div>
              <label className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white px-4 py-2 font-bold text-[var(--primary)]">
                <Checkbox
                  checked={receiptNeeded}
                  name="receiptNeeded"
                  onCheckedChange={(checked) => setReceiptNeeded(checked === true)}
                />
                Demander un Cerfa
              </label>
            </div>

            {receiptNeeded && (
              <Card className="border-[var(--accent)]/20 bg-[var(--accent-soft)]/60">
                <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                  <NativeSelect
                    defaultValue={
                      donorType === "ENTREPRISE" ? "ENTREPRISE" : "PARTICULIER"
                    }
                    name="receiptType"
                  >
                    <NativeSelectOption value="PARTICULIER">
                      Particulier
                    </NativeSelectOption>
                    <NativeSelectOption value="ENTREPRISE">
                      Entreprise
                    </NativeSelectOption>
                    <NativeSelectOption value="ISF_IFI">IFI</NativeSelectOption>
                    <NativeSelectOption value="AUTRE">Autre</NativeSelectOption>
                  </NativeSelect>
                  <Input
                    name="receiptTaxId"
                    placeholder={
                      donorType === "ENTREPRISE"
                        ? "SIREN / SIRET"
                        : "Identifiant fiscal si necessaire"
                    }
                  />
                  <Input
                    className="sm:col-span-2"
                    name="receiptAddress"
                    placeholder="Adresse"
                  />
                  <Input name="receiptZip" placeholder="Code postal" />
                  <Input name="receiptCity" placeholder="Ville" />
                  <Input
                    defaultValue="France"
                    name="receiptCountry"
                    placeholder="Pays"
                  />
                </CardContent>
              </Card>
            )}
          </section>

          <Card className="border-[var(--border)] bg-[var(--primary-soft)]">
            <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="grid gap-2">
                <strong className="text-[var(--primary)]">
                  Resume: {moneyLabel(effectiveAmount, currency)}
                  {frequency === "MONTHLY" ? " par mois" : ""}
                </strong>
                <span className="text-sm text-[var(--muted)]">
                  {selectedCampaign?.label} - {amountImpact(effectiveAmount)}
                  {receiptNeeded ? " - Recu Cerfa demande" : ""}
                </span>
              </div>
              <Button size="lg" type="submit">
                <HeartHandshake className="size-5" />
                Payer avec Stripe
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-3">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[var(--success)]" />
              Don cree en base
            </span>
            <span className="flex items-center gap-2">
              <Mail className="size-4 text-[var(--success)]" />
              Rattachement par email
            </span>
            <span className="flex items-center gap-2">
              <ReceiptText className="size-4 text-[var(--success)]" />
              Suivi Cerfa admin
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
