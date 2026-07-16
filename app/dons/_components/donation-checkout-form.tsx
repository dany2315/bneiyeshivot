"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeEuro,
  Building2,
  CheckCircle2,
  ClipboardCheck,
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
import { Textarea } from "@/components/ui/textarea";
import { PhoneInputGroup } from "@/components/phone-input-group";

const recurringDurations = [
  { value: "3", label: "3 mois" },
  { value: "6", label: "6 mois" },
  { value: "12", label: "12 mois" },
  { value: "24", label: "24 mois" },
  { value: "0", label: "Sans limite" },
];

const legalForms = [
  "Association",
  "SARL",
  "SAS",
  "SA",
  "EURL",
  "SCI",
  "Auto-entrepreneur",
  "Autre",
];

const impactByAmount = [
  { min: 20, label: "Un dossier accompagne" },
  { min: 50, label: "Une aide administrative concrete" },
  { min: 100, label: "Un soutien terrain renforce" },
  { min: 180, label: "Un programme Torah soutenu" },
  { min: 260, label: "Un jeune suivi sur plusieurs etapes" },
  { min: 500, label: "Un vrai levier pour une action collective" },
];

const steps = [
  { title: "Don", icon: BadgeEuro },
  { title: "Donateur", icon: User },
  { title: "Confirmation", icon: ClipboardCheck },
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

function StepHeader({
  description,
  icon,
  number,
  title,
}: {
  description: string;
  icon: ReactNode;
  number: string;
  title: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-sm font-black text-white">
        {number}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)]">{icon}</span>
          <h2 className="text-lg font-bold text-[var(--primary)]">{title}</h2>
        </div>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

export function DonationCheckoutForm() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("50");
  const currency = "EUR";
  const [frequency, setFrequency] = useState<"ONE_TIME" | "MONTHLY">("ONE_TIME");
  const [recurringMonths, setRecurringMonths] = useState("12");
  const [donorType, setDonorType] = useState<"PARTICULIER" | "ENTREPRISE">(
    "PARTICULIER",
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");

  const effectiveAmount = useMemo(() => {
    const custom = Number(customAmount.replace(",", "."));

    if (Number.isFinite(custom) && custom > 0) {
      return custom;
    }

    return selectedAmount;
  }, [customAmount, selectedAmount]);

  const providerLabel = "Stripe";
  const recurringLabel =
    frequency === "MONTHLY"
      ? recurringDurations.find((item) => item.value === recurringMonths)?.label
      : null;
  const donorName = [firstName, lastName].filter(Boolean).join(" ");
  const afterTaxAmount = effectiveAmount * 0.34;

  function validateStep(step: number) {
    if (step === 0 && effectiveAmount <= 0) {
      return "Choisissez un montant valide.";
    }

    if (step === 1) {
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        return "Prenom, nom et email sont obligatoires.";
      }

      if (donorType === "ENTREPRISE" && !companyName.trim()) {
        return "Le nom de l'entreprise est obligatoire.";
      }
    }

    return "";
  }

  function goNext() {
    const nextError = validateStep(activeStep);

    if (nextError) {
      setError(nextError);
      return;
    }

    setError("");
    setActiveStep((step) => Math.min(step + 1, steps.length - 1));
  }

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
                Avancez etape par etape. Le recu Cerfa est genere automatiquement
                pour chaque don confirme.
              </CardDescription>
            </div>
          </div>
          <Badge variant="info" className="gap-2 px-3 py-2">
            <ShieldCheck className="size-4" />
            {providerLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <form action="/api/dons/checkout" className="grid gap-5" method="post">
          <input name="amount" type="hidden" value={selectedAmount} />
          <input name="currency" type="hidden" value="EUR" />
          <input name="donorType" type="hidden" value={donorType} />
          <input name="receiptNeeded" type="hidden" value="on" />

          <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-white p-3 sm:p-4">
            <div className="grid grid-cols-3 gap-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isDone = index < activeStep;
                const isActive = index === activeStep;

                return (
                  <button
                    className="grid min-h-16 place-items-center rounded-xl border px-2 text-center text-xs font-bold transition data-[active=true]:border-[var(--accent)]/60 data-[active=true]:bg-[var(--accent-soft)] data-[done=true]:border-[var(--success)]/30 data-[done=true]:bg-[var(--success-soft)]"
                    data-active={isActive}
                    data-done={isDone}
                    key={step.title}
                    onClick={() => {
                      if (index <= activeStep) {
                        setActiveStep(index);
                        setError("");
                      }
                    }}
                    type="button"
                  >
                    <Icon className="size-4 text-[var(--accent)]" />
                    <span>{step.title}</span>
                  </button>
                );
              })}
            </div>

            {activeStep > 0 && (
              <div className="rounded-xl bg-[var(--primary-soft)] p-3 text-sm text-[var(--primary)]">
                <strong>Resume:</strong> {moneyLabel(effectiveAmount, currency)}
                {frequency === "MONTHLY" ? " par mois" : ""} -{" "}
                {recurringLabel ?? "Don ponctuel"}
                {donorName ? ` - ${donorName}` : ""}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <section
            className={
              activeStep === 0
                ? "rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-5"
                : "hidden"
            }
          >
            <StepHeader
              description="Choisissez une proposition ou entrez un montant libre."
              icon={<BadgeEuro className="size-5" />}
              number="1"
              title="Montant et frequence"
            />

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
              {donationAmountOptions.map((amount) => (
                <button
                  className="grid min-h-20 place-items-center rounded-xl border border-[var(--border)] bg-white font-serif text-2xl font-bold text-[var(--primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-md data-[selected=true]:border-[var(--accent)]/50 data-[selected=true]:bg-[var(--accent-soft)] data-[selected=true]:text-[var(--accent-strong)] sm:min-h-24 sm:text-3xl"
                  data-selected={
                    selectedAmount === amount &&
                    Number(customAmount.replace(",", ".")) === amount
                  }
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount(String(amount));
                  }}
                  type="button"
                >
                  {amount} EUR
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3">
              <Label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--primary)]">
                  Montant
                </span>
                <InputGroup className="h-16 border-[var(--accent)]/35 bg-white shadow-[0_14px_40px_rgba(255,127,42,0.12)]">
                  <InputGroupInput
                    className="text-2xl font-black text-[var(--primary)]"
                    min="1"
                    name="customAmount"
                    onChange={(event) => {
                      setCustomAmount(event.target.value);
                      const amount = Number(event.target.value.replace(",", "."));

                      if (Number.isFinite(amount) && amount > 0) {
                        setSelectedAmount(amount);
                      }
                    }}
                    placeholder="Autre montant"
                    step="0.01"
                    type="number"
                    value={customAmount}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText className="text-lg font-black text-[var(--accent)]">
                      {currency}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Label>
              <div className="rounded-2xl border border-[var(--success)]/25 bg-[var(--success-soft)] p-4">
                <span className="text-sm font-bold text-[var(--primary)]">
                  Apres reduction fiscale de 66%, ce don ne vous coute que
                </span>
                <strong className="mt-1 block font-serif text-3xl text-[var(--success)]">
                  {moneyLabel(afterTaxAmount, currency)}
                </strong>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--border)] pt-5">
              <div className="flex items-center gap-2 text-[var(--primary)]">
                <Repeat2 className="size-5 text-[var(--accent)]" />
                <h3 className="text-lg font-bold">Frequence</h3>
              </div>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Pour un don recurrent, indiquez aussi la duree souhaitee.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
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

            {frequency === "MONTHLY" && (
              <Label className="mt-4 grid gap-2">
                <span className="text-sm font-bold text-[var(--primary)]">
                  Pendant combien de mois ?
                </span>
                <NativeSelect
                  className="w-full sm:w-64"
                  name="recurringMonths"
                  onChange={(event) => setRecurringMonths(event.target.value)}
                  value={recurringMonths}
                >
                  {recurringDurations.map((duration) => (
                    <NativeSelectOption key={duration.value} value={duration.value}>
                      {duration.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Label>
            )}
          </section>

          <section
            className={
              activeStep === 1
                ? "rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-5"
                : "hidden"
            }
          >
            <StepHeader
              description="Une seule saisie pour le paiement, le donateur et le recu Cerfa."
              icon={<User className="size-5" />}
              number="2"
              title="Donateur et Cerfa"
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                className="flex min-h-14 items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 text-left transition data-[selected=true]:border-[var(--accent)]/50 data-[selected=true]:bg-[var(--accent-soft)]"
                data-selected={donorType === "PARTICULIER"}
                onClick={() => {
                  setDonorType("PARTICULIER");
                }}
                type="button"
              >
                <User className="size-5 text-[var(--accent)]" />
                <strong className="text-[var(--primary)]">Particulier</strong>
              </button>
              <button
                className="flex min-h-14 items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 text-left transition data-[selected=true]:border-[var(--accent)]/50 data-[selected=true]:bg-[var(--accent-soft)]"
                data-selected={donorType === "ENTREPRISE"}
                onClick={() => {
                  setDonorType("ENTREPRISE");
                }}
                type="button"
              >
                <Building2 className="size-5 text-[var(--accent)]" />
                <strong className="text-[var(--primary)]">Entreprise</strong>
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input
                name="firstName"
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Prenom"
                value={firstName}
              />
              <Input
                name="lastName"
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Nom"
                value={lastName}
              />
              <Input
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                type="email"
                value={email}
              />
              <PhoneInputGroup id="don-phone" name="phone" />

              {donorType === "ENTREPRISE" && (
                <>
                  <Input
                    name="companyName"
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="Nom de l'entreprise"
                    value={companyName}
                  />
                  <NativeSelect className="w-full" name="companyLegalForm">
                    {legalForms.map((form) => (
                      <NativeSelectOption key={form} value={form}>
                        {form}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </>
              )}

              <div className="rounded-xl border border-[var(--border)] bg-[var(--subtle)]/60 p-3 text-sm text-[var(--muted)] sm:col-span-2">
                Le recu fiscal sera genere automatiquement en mode{" "}
                <strong className="text-[var(--primary)]">
                  {donorType === "ENTREPRISE" ? "entreprise" : "particulier"}
                </strong>
                .
              </div>
              {donorType === "ENTREPRISE" && (
                <Input name="receiptTaxId" placeholder="SIREN / SIRET" />
              )}
              <div className="rounded-xl border border-[var(--border)] bg-white p-3 text-sm leading-6 text-[var(--muted)] sm:col-span-2">
                L'adresse fiscale sera recuperee dans l'etape de paiement Stripe
                pour eviter une double saisie.
              </div>
            </div>

            <Label className="mt-3 grid gap-2">
              <Textarea
                name="dedication"
                placeholder="Pour une refoua, une reussite, a la memoire de..."
              />
            </Label>
          </section>

          <section
            className={
              activeStep === 2
                ? "rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent-soft)]/55 p-4 sm:p-5"
                : "hidden"
            }
          >
            <StepHeader
              description="Verifiez le recapitulatif puis passez au paiement securise."
              icon={<ClipboardCheck className="size-5" />}
              number="3"
              title="Confirmation"
            />

            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-white p-4">
                <span className="text-[var(--muted)]">Montant</span>
                <strong className="mt-1 block text-lg text-[var(--primary)]">
                  {moneyLabel(effectiveAmount, currency)}
                  {frequency === "MONTHLY" ? " / mois" : ""}
                </strong>
              </div>
              <div className="rounded-xl bg-white p-4">
                <span className="text-[var(--muted)]">Frequence</span>
                <strong className="mt-1 block text-lg text-[var(--primary)]">
                  {recurringLabel ?? "Don ponctuel"}
                </strong>
              </div>
              <div className="rounded-xl bg-white p-4">
                <span className="text-[var(--muted)]">Donateur</span>
                <strong className="mt-1 block text-lg text-[var(--primary)]">
                  {donorName || "-"}
                </strong>
                <span className="text-[var(--muted)]">{email || "-"}</span>
              </div>
              <div className="rounded-xl bg-white p-4">
                <span className="text-[var(--muted)]">Recu fiscal</span>
                <strong className="mt-1 block text-lg text-[var(--primary)]">
                  Recu Cerfa automatique
                </strong>
                <span className="text-[var(--muted)]">
                  Envoye avec le mail de remerciement.
                </span>
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--primary)] transition hover:bg-[var(--primary-soft)] disabled:pointer-events-none disabled:opacity-50"
              disabled={activeStep === 0}
              onClick={() => {
                setActiveStep((step) => Math.max(step - 1, 0));
                setError("");
              }}
              type="button"
            >
              <ArrowLeft className="size-4" />
              Retour
            </button>

            {activeStep < steps.length - 1 ? (
              <button
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 text-sm font-bold text-white shadow-[0_14px_32px_rgba(6,40,70,0.18)] transition hover:bg-[#0b3b63]"
                onClick={goNext}
                type="button"
              >
                Suivant
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <Button size="lg" type="submit">
                <HeartHandshake className="size-5" />
                Je donne {moneyLabel(effectiveAmount, currency)}
              </Button>
            )}
          </div>

          <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-3">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[var(--success)]" />
              Paiement securise
            </span>
            <span className="flex items-center gap-2">
              <Mail className="size-4 text-[var(--success)]" />
              Email de confirmation
            </span>
            <span className="flex items-center gap-2">
              <ReceiptText className="size-4 text-[var(--success)]" />
              Recu Cerfa automatique
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
