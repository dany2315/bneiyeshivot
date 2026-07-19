"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AddressElement,
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  ArrowLeft,
  ArrowRight,
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
import { donationAmountOptions, donationCurrencyOptions } from "@/lib/donations";
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
  { title: "Paiement", icon: ShieldCheck },
];

type DonationCurrency = (typeof donationCurrencyOptions)[number]["value"];

type NedarimFields = Record<string, string>;

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

function EmbeddedPaymentForm({
  amount,
  donationId,
}: {
  amount: string;
  donationId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  async function confirmPayment() {
    if (!stripe || !elements) return;

    setIsConfirming(true);
    setPaymentError("");

    const addressElement = elements.getElement(AddressElement);
    const addressValue = await addressElement?.getValue();

    if (!addressValue?.complete) {
      setPaymentError("Adresse fiscale obligatoire pour le recu Cerfa.");
      setIsConfirming(false);
      return;
    }

    const addressResponse = await fetch("/api/dons/receipt-address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donationId,
        name: addressValue.value.name,
        address: addressValue.value.address,
      }),
    });

    if (!addressResponse.ok) {
      const payload = await addressResponse.json().catch(() => null);

      setPaymentError(
        payload?.error ?? "Adresse fiscale invalide pour le recu Cerfa.",
      );
      setIsConfirming(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            address: addressValue.value.address,
            name: addressValue.value.name,
          },
        },
        return_url: `${window.location.origin}/dons/merci?donation=${donationId}`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setPaymentError(result.error.message ?? "Paiement refuse par Stripe.");
      setIsConfirming(false);
      return;
    }

    window.location.href = `/dons/merci?donation=${donationId}`;
  }

  return (
    <div className="grid gap-4">
      <PaymentElement />
      {paymentError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {paymentError}
        </div>
      ) : null}
      <Button
        className="h-12 px-6"
        disabled={!stripe || isConfirming}
        onClick={confirmPayment}
        size="lg"
        type="button"
      >
        <ShieldCheck className="size-5" />
        {isConfirming ? "Validation..." : `Payer ${amount}`}
      </Button>
    </div>
  );
}

function NedarimPaymentFrame({
  amount,
  donationId,
  fields,
}: {
  amount: string;
  donationId: string;
  fields: NedarimFields;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(420);
  const [paymentError, setPaymentError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  function postToNedarim(data: unknown) {
    iframeRef.current?.contentWindow?.postMessage(data, "https://matara.pro");
  }

  useEffect(() => {
    function readPostMessage(event: MessageEvent) {
      if (event.origin !== "https://matara.pro") return;

      const data = event.data as
        | { Name?: string; Value?: unknown }
        | undefined;

      if (data?.Name === "Height") {
        const height = Number(data.Value);

        if (Number.isFinite(height) && height > 0) {
          setFrameHeight(height + 15);
        }
      }

      if (data?.Name === "TransactionResponse") {
        const response =
          data.Value && typeof data.Value === "object"
            ? (data.Value as Record<string, unknown>)
            : {};

        if (response.Status === "Error") {
          setPaymentError(String(response.Message ?? "Paiement refuse."));
          setIsConfirming(false);
          return;
        }

        fetch("/api/dons/nedarim-plus/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ donationId, response }),
        })
          .then(async (result) => {
            if (!result.ok) {
              const payload = await result.json().catch(() => null);
              throw new Error(
                payload?.error ?? "Paiement confirme, synchronisation incomplete.",
              );
            }

            setIsPaid(true);
            window.location.href = `/dons/merci?donation=${donationId}`;
          })
          .catch((error: unknown) => {
            setPaymentError(
              error instanceof Error
                ? error.message
                : "Paiement confirme, synchronisation incomplete.",
            );
            setIsConfirming(false);
          });
      }
    }

    window.addEventListener("message", readPostMessage);

    return () => window.removeEventListener("message", readPostMessage);
  }, [donationId]);

  function startPayment() {
    setPaymentError("");
    setIsConfirming(true);
    postToNedarim({
      Name: "FinishTransaction2",
      Value: fields,
    });
  }

  return (
    <div className="grid gap-4">
      <iframe
        className="w-full rounded-xl border border-[var(--border)] bg-white"
        onLoad={() => postToNedarim({ Name: "GetHeight" })}
        ref={iframeRef}
        scrolling="no"
        src="https://matara.pro/nedarimplus/iframe?language=en&Picture=Hide"
        style={{ height: `${frameHeight}px` }}
        title="Paiement securise"
      />
      {paymentError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {paymentError}
        </div>
      ) : null}
      {isPaid ? (
        <div className="rounded-xl border border-[var(--success)]/25 bg-[var(--success-soft)] p-3 text-sm font-bold text-[var(--success)]">
          Paiement confirme.
        </div>
      ) : null}
      <Button
        className="h-12 px-6"
        disabled={isConfirming}
        onClick={startPayment}
        size="lg"
        type="button"
      >
        <ShieldCheck className="size-5" />
        {isConfirming ? "Validation..." : `Payer ${amount}`}
      </Button>
    </div>
  );
}

export function DonationCheckoutForm({
  stripePublishableKey,
  nedarimPlusEnabled,
}: {
  stripePublishableKey: string;
  nedarimPlusEnabled: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("50");
  const [currency, setCurrency] = useState<DonationCurrency>("EUR");
  const [frequency, setFrequency] = useState<"ONE_TIME" | "MONTHLY">("ONE_TIME");
  const [recurringMonths, setRecurringMonths] = useState("12");
  const [donorType, setDonorType] = useState<"PARTICULIER" | "ENTREPRISE">(
    "PARTICULIER",
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nedarimZeout, setNedarimZeout] = useState("");
  const [nedarimStreet, setNedarimStreet] = useState("");
  const [nedarimCity, setNedarimCity] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [donationId, setDonationId] = useState("");
  const [nedarimFields, setNedarimFields] = useState<NedarimFields | null>(null);
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);
  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    [stripePublishableKey],
  );

  const effectiveAmount = useMemo(() => {
    const custom = Number(customAmount.replace(",", "."));

    if (Number.isFinite(custom) && custom > 0) {
      return custom;
    }

    return selectedAmount;
  }, [customAmount, selectedAmount]);

  const recurringLabel =
    frequency === "MONTHLY"
      ? recurringDurations.find((item) => item.value === recurringMonths)?.label
      : null;
  const donorName = [firstName, lastName].filter(Boolean).join(" ");
  const afterTaxAmount = effectiveAmount * 0.34;
  const isNedarimPayment = currency === "ILS";
  const receiptAvailable = currency === "EUR";

  function validateStep(step: number) {
    if (step === 0 && effectiveAmount <= 0) {
      return "Choisissez un montant valide.";
    }

    if (step === 1) {
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
        return "Prenom, nom, email et telephone sont obligatoires.";
      }

      if (donorType === "ENTREPRISE" && !companyName.trim()) {
        return "Le nom de l'entreprise est obligatoire.";
      }

      if (isNedarimPayment && (!nedarimStreet.trim() || !nedarimCity.trim())) {
        return "Rue et ville sont obligatoires pour un paiement en shekel.";
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
    setActiveStep((step) => Math.min(step + 1, 1));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextError = validateStep(1);

    if (nextError) {
      setActiveStep(1);
      setError(nextError);
      return;
    }

    setError("");
  }

  async function preparePayment() {
    const nextError = validateStep(1);

    if (nextError) {
      setActiveStep(1);
      setError(nextError);
      return;
    }

    if (isNedarimPayment) {
      if (!nedarimPlusEnabled) {
        setError("Nedarim Plus n'est pas configure pour les paiements en shekel.");
        return;
      }
    } else if (!stripePublishableKey) {
      setError("STRIPE_PUBLISHABLE_KEY est manquant.");
      return;
    }

    if (!formRef.current) return;

    setIsPreparingPayment(true);
    setError("");

    const response = await fetch(
      isNedarimPayment
        ? "/api/dons/nedarim-plus/prepare"
        : "/api/dons/payment-intent",
      {
      method: "POST",
      body: new FormData(formRef.current),
      },
    );
    const payload = (await response.json().catch(() => null)) as
      | {
          clientSecret?: string;
          donationId?: string;
          fields?: NedarimFields;
          error?: string;
        }
      | null;

    if (
      !response.ok ||
      !payload?.donationId ||
      (isNedarimPayment ? !payload.fields : !payload.clientSecret)
    ) {
      setError(
        payload?.error ??
          `Impossible de preparer le paiement ${
            isNedarimPayment ? "Nedarim Plus" : "Stripe"
          }.`,
      );
      setIsPreparingPayment(false);
      return;
    }

    setClientSecret(payload.clientSecret ?? "");
    setNedarimFields(payload.fields ?? null);
    setDonationId(payload.donationId);
    setActiveStep(2);
    setIsPreparingPayment(false);
  }

  return (
    <Card
      id="don-form"
      className="mx-auto max-w-3xl overflow-hidden border-[var(--border)] bg-white/95 shadow-[0_18px_48px_rgba(6,40,70,0.08)]"
    >
      <CardHeader className="border-b border-[var(--border)] bg-[var(--subtle)]/70 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
              <BadgeEuro className="size-5" />
            </span>
            <div>
              <CardTitle className="text-xl sm:text-2xl">Finaliser mon don</CardTitle>
              <CardDescription>
                Avancez etape par etape. Le recu Cerfa est genere automatiquement
                pour chaque don confirme.
              </CardDescription>
            </div>
          </div>
          <Badge variant="info" className="gap-2 px-3 py-2">
            <ShieldCheck className="size-4" />
            Paiement securise
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <form
          className="grid gap-4"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <input name="amount" type="hidden" value={selectedAmount} />
          <input name="currency" type="hidden" value={currency} />
          <input name="donorType" type="hidden" value={donorType} />
          {receiptAvailable ? (
            <input name="receiptNeeded" type="hidden" value="on" />
          ) : null}

          <div className="grid gap-3">
            <div className="relative grid grid-cols-2 gap-4">
              <span className="absolute top-5 right-[16%] left-[16%] h-0.5 bg-[var(--border)]" />
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isDone = index < activeStep;
                const isActive = index === activeStep;

                return (
                  <button
                    className="relative z-10 grid justify-items-center gap-2 bg-transparent text-center text-xs font-bold text-[var(--muted)] transition data-[active=true]:text-[var(--primary)] data-[done=true]:text-[var(--success)]"
                    data-active={isActive}
                    data-done={isDone}
                    key={step.title}
                    onClick={() => {
                      if (index <= activeStep && (index < 2 || clientSecret)) {
                        setActiveStep(index);
                        setError("");
                      }
                    }}
                    type="button"
                  >
                    <span
                      className="grid size-10 place-items-center rounded-full border border-[var(--border)] bg-white shadow-sm transition data-[active=true]:border-[var(--accent)] data-[active=true]:bg-[var(--accent-soft)] data-[done=true]:border-[var(--success)] data-[done=true]:bg-[var(--success-soft)]"
                      data-active={isActive}
                      data-done={isDone}
                    >
                      {isDone ? (
                        <CheckCircle2 className="size-5 text-[var(--success)]" />
                      ) : (
                        <Icon className="size-5 text-[var(--accent)]" />
                      )}
                    </span>
                    <span>{step.title}</span>
                  </button>
                );
              })}
            </div>

            {activeStep > 0 && (
              <div className="grid gap-3 rounded-xl bg-[var(--primary-soft)] p-3 text-sm text-[var(--primary)]">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-base">Votre don</strong>
                  <Badge variant="success" className="px-2 py-1">
                    {moneyLabel(effectiveAmount, currency)}
                    {frequency === "MONTHLY" ? " / mois" : ""}
                  </Badge>
                  <span className="font-bold">{recurringLabel ?? "Don ponctuel"}</span>
                  {donorName ? <span>pour {donorName}</span> : null}
                </div>
                <div className="grid gap-2 text-xs font-bold text-[var(--muted)]">
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
                    {receiptAvailable
                      ? "Recu Cerfa automatique"
                      : "Confirmation de paiement sans Cerfa"}
                  </span>
                </div>
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
                ? "rounded-xl border border-[var(--border)] bg-white p-4"
                : "hidden"
            }
          >
            <StepHeader
              description="Choisissez une proposition ou entrez un montant libre."
              icon={<BadgeEuro className="size-5" />}
              number="1"
              title="Montant et frequence"
            />

            <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-3">
              {donationAmountOptions.map((amount) => (
                <button
                  className="grid min-h-16 place-items-center rounded-xl border border-[var(--border)] bg-white font-serif text-xl font-bold text-[var(--primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-md data-[selected=true]:border-[var(--accent)]/50 data-[selected=true]:bg-[var(--accent-soft)] data-[selected=true]:text-[var(--accent-strong)] sm:min-h-20 sm:text-2xl"
                  data-selected={
                    selectedAmount === amount &&
                    Number(customAmount.replace(",", ".")) === amount
                  }
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount(String(amount));
                    setClientSecret("");
                    setNedarimFields(null);
                  }}
                  type="button"
                >
                  {amount} {currency}
                </button>
              ))}
            </div>

            <div className="mt-4 grid justify-items-center gap-3">
              <Label className="grid w-full max-w-sm gap-2">
                <span className="text-sm font-bold text-[var(--primary)]">
                  Montant
                </span>
                <InputGroup className="h-16 border-[var(--accent)]/45 bg-white shadow-[0_14px_34px_rgba(255,127,42,0.14)]">
                  <InputGroupInput
                    className="text-center text-3xl font-black text-[var(--primary)]"
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
                  <InputGroupAddon
                    align="inline-end"
                    className="cursor-default pr-1.5"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <NativeSelect
                      aria-label="Devise du don"
                      className="h-11 w-24 border-0 bg-[var(--accent-soft)] px-2 text-sm font-black text-[var(--accent-strong)] shadow-none focus-visible:ring-0"
                      onChange={(event) => {
                        setCurrency(event.target.value as DonationCurrency);
                        setClientSecret("");
                        setNedarimFields(null);
                      }}
                      value={currency}
                    >
                      {donationCurrencyOptions.map((option) => (
                        <NativeSelectOption
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </InputGroupAddon>
                </InputGroup>
              </Label>
              {receiptAvailable ? (
                <div className="w-full max-w-sm rounded-2xl border border-[var(--success)]/25 bg-[var(--success-soft)] p-4 text-center">
                  <span className="text-sm font-bold text-[var(--primary)]">
                    Apres reduction fiscale de 66%, ce don ne vous coute que
                  </span>
                  <strong className="mt-1 block font-serif text-xl text-[var(--success)]">
                    {moneyLabel(afterTaxAmount, currency)}
                  </strong>
                </div>
              ) : (
                <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--subtle)] p-4 text-center">
                  <span className="text-sm font-bold text-[var(--primary)]">
                    Paiement en shekel traite en Israel, sans recu Cerfa ni
                    deduction fiscale francaise.
                  </span>
                </div>
              )}
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
                className="flex min-h-16 items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-left transition data-[selected=true]:border-[var(--accent)]/50 data-[selected=true]:bg-[var(--accent-soft)]"
                data-selected={frequency === "ONE_TIME"}
                onClick={() => setFrequency("ONE_TIME")}
                type="button"
              >
                <Gift className="size-5 text-[var(--accent)]" />
                <span className="grid gap-0.5">
                  <strong className="text-[var(--primary)]">Don ponctuel</strong>
                  <small className="text-[var(--muted)]">Une seule fois</small>
                </span>
              </button>
              <button
                className="flex min-h-16 items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-left transition data-[selected=true]:border-[var(--accent)]/50 data-[selected=true]:bg-[var(--accent-soft)]"
                data-selected={frequency === "MONTHLY"}
                onClick={() => setFrequency("MONTHLY")}
                type="button"
              >
                <Repeat2 className="size-5 text-[var(--accent)]" />
                <span className="grid gap-0.5">
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
              activeStep === 2
                ? "rounded-xl border border-[var(--border)] bg-white p-4"
                : "hidden"
            }
          >
            <StepHeader
              description={
                isNedarimPayment
                  ? "Saisissez votre carte bancaire dans le module securise pour les paiements en shekel."
                  : "Saisissez votre carte bancaire dans un module Stripe securise, sans quitter la page."
              }
              icon={<ShieldCheck className="size-5" />}
              number="3"
              title="Paiement securise"
            />

            <div className="mt-5 grid gap-4">
              <div className="rounded-xl border border-[var(--success)]/25 bg-[var(--success-soft)] p-4">
                <strong className="text-[var(--primary)]">
                  {moneyLabel(effectiveAmount, currency)}
                  {frequency === "MONTHLY" ? " / mois" : ""}
                </strong>
                <p className="mt-1 text-sm font-bold text-[var(--muted)]">
                  {frequency === "MONTHLY"
                    ? `Don mensuel - ${recurringLabel ?? "sans limite"}`
                    : "Don ponctuel"}
                </p>
              </div>
              {isNedarimPayment && nedarimFields ? (
                <NedarimPaymentFrame
                  amount={moneyLabel(effectiveAmount, currency)}
                  donationId={donationId}
                  fields={nedarimFields}
                />
              ) : stripePromise && clientSecret ? (
                <Elements
                  options={{
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#062846",
                        colorText: "#061e39",
                        borderRadius: "10px",
                      },
                    },
                    clientSecret,
                  }}
                  stripe={stripePromise}
                >
                  <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-4">
                    <div>
                      <h3 className="font-bold text-[var(--primary)]">
                        Adresse fiscale pour le Cerfa
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                        Adresse obligatoire, collectee par Stripe et enregistree
                        sur le dossier du don avant validation du paiement.
                      </p>
                    </div>
                    <AddressElement
                      options={{
                        mode: "billing",
                        defaultValues: {
                          name: donorName,
                        },
                      }}
                    />
                  </div>
                  <EmbeddedPaymentForm
                    amount={moneyLabel(effectiveAmount, currency)}
                    donationId={donationId}
                  />
                </Elements>
              ) : null}
            </div>
          </section>

          <section
            className={
              activeStep === 1
                ? "rounded-xl border border-[var(--border)] bg-white p-4"
                : "hidden"
            }
          >
            <StepHeader
              description={
                receiptAvailable
                  ? "Une seule saisie pour le paiement, le donateur et le recu Cerfa."
                  : "Une seule saisie pour le paiement et la confirmation du don."
              }
              icon={<User className="size-5" />}
              number="2"
              title={receiptAvailable ? "Donateur et Cerfa" : "Donateur"}
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
              <PhoneInputGroup
                id="don-phone"
                name="phone"
                onValueChange={setPhone}
                required
              />

              {isNedarimPayment ? (
                <>
                  <Input
                    inputMode="numeric"
                    maxLength={9}
                    name="nedarimZeout"
                    onChange={(event) => setNedarimZeout(event.target.value)}
                    placeholder="Teoudat zehout (si disponible)"
                    value={nedarimZeout}
                  />
                  <Input
                    name="nedarimStreet"
                    onChange={(event) => setNedarimStreet(event.target.value)}
                    placeholder="Rue"
                    required
                    value={nedarimStreet}
                  />
                  <Input
                    name="nedarimCity"
                    onChange={(event) => setNedarimCity(event.target.value)}
                    placeholder="Ville"
                    required
                    value={nedarimCity}
                  />
                </>
              ) : null}

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

              {donorType === "ENTREPRISE" && (
                <Input name="receiptTaxId" placeholder="SIREN / SIRET" />
              )}
            </div>

            <Label className="mt-3 grid gap-2">
              <Textarea
                name="dedication"
                placeholder="Pour une refoua, une reussite, a la memoire de..."
              />
            </Label>
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

            {activeStep === 0 ? (
              <button
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 text-sm font-bold text-white shadow-[0_14px_32px_rgba(6,40,70,0.18)] transition hover:bg-[#0b3b63]"
                onClick={goNext}
                type="button"
              >
                Suivant
                <ArrowRight className="size-4" />
              </button>
            ) : activeStep === 1 ? (
              <Button
                className="h-11 px-6"
                disabled={isPreparingPayment}
                onClick={preparePayment}
                size="lg"
                type="button"
              >
                <HeartHandshake className="size-5" />
                {isPreparingPayment
                  ? "Preparation..."
                  : `Continuer au paiement ${moneyLabel(effectiveAmount, currency)}`}
              </Button>
            ) : (
              <span className="text-sm font-bold text-[var(--muted)]">
                Paiement securise
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
