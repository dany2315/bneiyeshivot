"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Flag,
  UploadCloud,
} from "lucide-react";
import { DocumentAttachmentCard } from "@/components/document-attachment-card";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { countries } from "countries-list";

const steps = [
  { label: "Identite", detail: "Coordonnees" },
  { label: "Dossier", detail: "Informations" },
  { label: "Documents", detail: "Pieces" },
  { label: "Validation", detail: "Envoi" },
];

const regionNames = new Intl.DisplayNames(["fr"], { type: "region" });

function countryCodeToFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
}

const nationalityOptions = Object.keys(countries)
  .map((code) => ({
    value: code,
    label: regionNames.of(code) ?? countries[code as keyof typeof countries].name,
    flag: countryCodeToFlag(code),
  }))
  .sort((first, second) => first.label.localeCompare(second.label, "fr"));

function NationalityCombobox({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<(typeof nationalityOptions)[number]>();

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return nationalityOptions;
    }

    return nationalityOptions.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <div className="relative z-[100]">
      <input name={name} type="hidden" value={selected?.label ?? ""} />
      <button
        id={id}
        type="button"
        className="flex min-h-11 w-full items-center gap-2.5 rounded-xl border border-[var(--border)] bg-white px-[13px] py-2.5 text-left text-base font-semibold text-[var(--primary)]"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
      >
        <Flag className="size-4 text-[var(--accent)]" />
        <span className="inline-flex min-w-0 items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {selected ? (
            <>
              <span aria-hidden="true">{selected.flag}</span>
              {selected.label}
            </>
          ) : (
            "Selectionner la nationalite"
          )}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[9999] grid gap-2 rounded-2xl border border-[var(--border)] bg-white p-2.5 shadow-[0_22px_60px_rgba(6,40,70,0.16)]">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une nationalite..."
          />
          <div className="grid max-h-[280px] gap-0.5 overflow-y-auto pr-1" role="listbox">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="flex w-full items-center gap-2.5 rounded-[10px] border-0 bg-transparent px-2.5 py-[9px] text-left text-base font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)] aria-selected:bg-[var(--primary-soft)] [&_svg]:ml-auto [&_svg]:text-[var(--accent)]"
                role="option"
                aria-selected={selected?.value === option.value}
                onClick={() => {
                  setSelected(option);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <span aria-hidden="true">{option.flag}</span>
                <span>{option.label}</span>
                {selected?.value === option.value && <Check className="size-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function RequestStepForm({ type }: { type: "visa" | "koupat" }) {
  const [step, setStep] = useState(0);
  const [personStatus, setPersonStatus] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitState, setSubmitState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);
  const isVisa = type === "visa";
  const isKoupat = type === "koupat";
  const title = type === "visa" ? "Visa etudiant" : "Koupat Holim";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "loading", message: "Envoi du dossier..." });

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        kind: type,
      }),
    });
    const result = (await response.json()) as {
      ok: boolean;
      requestId?: string;
      message?: string;
      issues?: { message: string }[];
    };

    if (!response.ok || !result.ok) {
      setSubmitState({
        status: "error",
        message:
          result.issues?.[0]?.message ??
          result.message ??
          "Impossible d'envoyer la demande.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      message: `Demande creee. Reference dossier : ${result.requestId}`,
    });
  }

  return (
    <Card className="relative z-20 max-w-[760px] overflow-visible">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {isVisa
            ? "Formulaire de demande de visa etudiant avec les informations et pieces demandees."
            : "Formulaire de demande koupat holim avec les informations et pieces demandees."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" onSubmit={handleSubmit}>
        <div className="grid gap-3">
          <div className="stepper-grid">
            {steps.map(({ label, detail }, index) => (
              <button
                className="step-dot"
                data-active={index === step}
                data-complete={index < step}
                key={label}
                type="button"
                onClick={() => setStep(index)}
              >
                <span className="step-index">
                  {index < step ? <Check className="size-4" /> : index + 1}
                </span>
                <span className="step-copy">
                  <span>{label}</span>
                  <small>{detail}</small>
                </span>
              </button>
            ))}
          </div>
          <Progress value={progress} />
        </div>

        {step === 0 && (
          <FieldGroup className="form-grid">
            <Field>
              <FieldLabel htmlFor={`${type}-first-name`}>Prenom</FieldLabel>
              <Input id={`${type}-first-name`} name="firstName" placeholder="David" required />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${type}-last-name`}>Nom</FieldLabel>
              <Input id={`${type}-last-name`} name="lastName" placeholder="Cohen" required />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${type}-email`}>Email</FieldLabel>
              <Input
                id={`${type}-email`}
                name="email"
                placeholder="email@exemple.com"
                required
                type="email"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${type}-phone`}>
                Telephone / WhatsApp
              </FieldLabel>
              <Input id={`${type}-phone`} name="phone" placeholder="+972 ..." required />
            </Field>
            {(isVisa || isKoupat) && (
              <>
                <Field>
                  <FieldLabel htmlFor={`${type}-birth-date`}>
                    Date de naissance
                  </FieldLabel>
                  <Input id={`${type}-birth-date`} name="birthDate" required type="date" />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${type}-nationality`}>
                    Nationalite
                  </FieldLabel>
                  <NationalityCombobox
                    id={`${type}-nationality`}
                    name="nationality"
                  />
                </Field>
              </>
            )}
          </FieldGroup>
        )}

        {step === 1 && (
          <FieldGroup className="form-grid">
            {isVisa || isKoupat ? (
              <>
                <Field>
                  {isVisa ? (
                    <>
                      <FieldLabel htmlFor="visa-person-status">
                        Statut de la personne
                      </FieldLabel>
                      <input name="personStatus" type="hidden" value={personStatus} />
                      <Select
                        value={personStatus}
                        onValueChange={(value) => setPersonStatus(value ?? "")}
                      >
                        <SelectTrigger className="h-11 w-full bg-white">
                          <SelectValue placeholder="Selectionner le statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bahour-yeshiva">
                            Bahour yeshiva
                          </SelectItem>
                          <SelectItem value="massa">Parti de Massa</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <>
                      <FieldLabel htmlFor="koupat-passport-number">
                        Numero de passeport non israelien
                      </FieldLabel>
                      <Input
                        id="koupat-passport-number"
                        name="passportNumber"
                        placeholder="Numero du passeport"
                        required
                      />
                    </>
                  )}
                </Field>
                {isVisa && (
                  <Field>
                    <FieldLabel htmlFor="visa-passport-number">
                      Numero de passeport non israelien
                    </FieldLabel>
                    <Input
                      id="visa-passport-number"
                      name="passportNumber"
                      placeholder="Numero du passeport"
                      required
                    />
                  </Field>
                )}
              </>
            ) : (
              <Field>
                <FieldLabel htmlFor={`${type}-country`}>
                  Pays d&apos;origine
                </FieldLabel>
                <Select>
                  <SelectTrigger className="h-11 w-full bg-white">
                    <SelectValue placeholder="Selectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="france">France</SelectItem>
                    <SelectItem value="israel">Israel</SelectItem>
                    <SelectItem value="autre">Autre pays</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor={`${type}-school`}>
                {isVisa
                  ? "Yeshiva / programme Massa"
                  : isKoupat
                    ? "Yeshiva / programme Massa"
                  : "Yeshiva / lieu d'etude"}
              </FieldLabel>
              <Input
                id={`${type}-school`}
                name="school"
                placeholder={
                  isVisa || isKoupat
                    ? "Nom de la yeshiva ou du programme"
                    : "Nom de la yeshiva"
                }
              />
            </Field>
            {!isVisa && !isKoupat && (
              <Field>
                <FieldLabel htmlFor={`${type}-arrival`}>
                  Date d&apos;arrivee prevue
                </FieldLabel>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
                  <Input id={`${type}-arrival`} className="pl-9" type="date" />
                </div>
                <FieldDescription>
                  Champ provisoire, a confirmer avec tes donnees exactes.
                </FieldDescription>
              </Field>
            )}
            <Field className="full">
              <FieldLabel htmlFor={`${type}-message`}>
                Details de la demande
              </FieldLabel>
              <Textarea
                id={`${type}-message`}
                name="message"
                placeholder={
                  type === "visa"
                    ? "Informations utiles pour le dossier visa..."
                    : "Informations utiles pour la demande koupat holim..."
                }
              />
            </Field>
          </FieldGroup>
        )}

        {step === 2 && (
          <div className="grid gap-3">
            {isVisa || isKoupat ? (
              <>
                <DocumentAttachmentCard
                  title="Photo du passeport non israelien"
                  status="missing"
                />
                <DocumentAttachmentCard
                  title={
                    isVisa
                      ? "Formulaire de visa rempli"
                      : "Formulaire koupat holim rempli"
                  }
                  status="missing"
                />
                {isVisa && (
                  <DocumentAttachmentCard
                    title="Acte de naissance"
                    status="missing"
                  />
                )}
                <DocumentAttachmentCard
                  title="Certificat d'etudiant ou Massa"
                  status="missing"
                />
              </>
            ) : (
              <>
                <DocumentAttachmentCard title="Passeport" status="missing" />
                <DocumentAttachmentCard
                  title="Document d'identite / visa"
                  status="missing"
                />
              </>
            )}
            <Button variant="secondary" type="button">
              <UploadCloud />
              Ajouter une autre piece
            </Button>
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--subtle)] p-4 text-sm text-[var(--muted)]">
              Les uploads seront branches ensuite sur AWS S3 avec statut par
              piece : manquante, recue, refusee ou validee.
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="icon-box">
                <FileCheck className="size-4" />
              </span>
              <h3 className="text-lg font-bold text-[var(--primary)]">
                Verification avant envoi
              </h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Le dossier sera cree dans l&apos;admin avec un statut initial, puis
              le Bahour pourra suivre les messages, documents et relances depuis
              son Espace Bahour.
            </p>
            {(isVisa || isKoupat) && (
              <Field orientation="horizontal" className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-4">
                <input
                  name="acceptTerms"
                  type="hidden"
                  value={acceptedTerms ? "true" : "false"}
                />
                <Checkbox
                  checked={acceptedTerms}
                  id={`${type}-terms`}
                  onCheckedChange={(value) => setAcceptedTerms(value === true)}
                />
                <div className="grid gap-1">
                  <FieldLabel htmlFor={`${type}-terms`}>
                    J&apos;accepte les conditions generales des demandes{" "}
                    {isVisa ? "de visa" : "de koupat holim"}
                  </FieldLabel>
                  <FieldDescription>
                    Cette acceptation sera obligatoire avant l&apos;envoi du
                    dossier.
                  </FieldDescription>
                </div>
              </Field>
            )}
          </div>
        )}

        {submitState.status !== "idle" && (
          <div
            className={
              submitState.status === "error"
                ? "rounded-xl border border-red-200 bg-red-50 p-4 text-base text-red-900"
                : submitState.status === "success"
                  ? "rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-base text-emerald-900"
                  : "rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-4 text-base text-[var(--primary)]"
            }
          >
            {submitState.message}
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-3">
          <Button
            disabled={step === 0}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            type="button"
            variant="secondary"
          >
            <ChevronLeft />
            Retour
          </Button>
          {step < steps.length - 1 ? (
            <Button
              onClick={() =>
                setStep((value) => Math.min(steps.length - 1, value + 1))
              }
              type="button"
            >
              Continuer
              <ChevronRight />
            </Button>
          ) : (
            <Button disabled={submitState.status === "loading"} type="submit">
              Envoyer la demande
              <Check />
            </Button>
          )}
        </div>
        </form>
      </CardContent>
    </Card>
  );
}

