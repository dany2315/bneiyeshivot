"use client";

import { type FormEvent, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Flag,
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
import { Spinner } from "@/components/ui/spinner";
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

const feminineNationalities: Record<string, string> = {
  AF: "Afghane",
  AL: "Albanaise",
  DZ: "Algerienne",
  DE: "Allemande",
  AD: "Andorrane",
  AO: "Angolaise",
  AR: "Argentine",
  AM: "Armenienne",
  AU: "Australienne",
  AT: "Autrichienne",
  AZ: "Azerbaidjanaise",
  BE: "Belge",
  BJ: "Beninoise",
  BA: "Bosnienne",
  BR: "Bresilienne",
  BG: "Bulgare",
  BF: "Burkinabe",
  BI: "Burundaise",
  KH: "Cambodgienne",
  CM: "Camerounaise",
  CA: "Canadienne",
  CL: "Chilienne",
  CN: "Chinoise",
  CO: "Colombienne",
  KM: "Comorienne",
  CG: "Congolaise",
  CD: "Congolaise",
  KR: "Sud-coreenne",
  KP: "Nord-coreenne",
  CI: "Ivoirienne",
  HR: "Croate",
  CU: "Cubaine",
  DK: "Danoise",
  EG: "Egyptienne",
  AE: "Emirienne",
  EC: "Equatorienne",
  ES: "Espagnole",
  EE: "Estonienne",
  US: "Americaine",
  ET: "Ethiopienne",
  FI: "Finlandaise",
  FR: "Francaise",
  GA: "Gabonaise",
  GM: "Gambienne",
  GE: "Georgienne",
  GH: "Ghaneenne",
  GR: "Grecque",
  GN: "Guineenne",
  HT: "Haitienne",
  HU: "Hongroise",
  IN: "Indienne",
  ID: "Indonesienne",
  IR: "Iranienne",
  IQ: "Irakienne",
  IE: "Irlandaise",
  IL: "Israelienne",
  IT: "Italienne",
  JP: "Japonaise",
  JO: "Jordanienne",
  KZ: "Kazakhstanaise",
  KE: "Kenyane",
  LB: "Libanaise",
  LY: "Libyenne",
  LT: "Lituanienne",
  LU: "Luxembourgeoise",
  MG: "Malgache",
  MY: "Malaisienne",
  ML: "Malienne",
  MA: "Marocaine",
  MR: "Mauritanienne",
  MX: "Mexicaine",
  MD: "Moldave",
  MC: "Monegasque",
  MN: "Mongole",
  ME: "Montenegrine",
  MZ: "Mozambicaine",
  NL: "Neerlandaise",
  NE: "Nigerienne",
  NG: "Nigeriane",
  NO: "Norvegienne",
  NZ: "Neo-zelandaise",
  PK: "Pakistanaise",
  PS: "Palestinienne",
  PE: "Peruvienne",
  PH: "Philippine",
  PL: "Polonaise",
  PT: "Portugaise",
  QA: "Qatarienne",
  RO: "Roumaine",
  GB: "Britannique",
  RU: "Russe",
  RW: "Rwandaise",
  SA: "Saoudienne",
  SN: "Senegalaise",
  RS: "Serbe",
  SG: "Singapourienne",
  SK: "Slovaque",
  SI: "Slovene",
  SO: "Somalienne",
  SD: "Soudanaise",
  SE: "Suedoise",
  CH: "Suisse",
  SY: "Syrienne",
  TD: "Tchadienne",
  CZ: "Tcheque",
  TH: "Thailandaise",
  TN: "Tunisienne",
  TR: "Turque",
  UA: "Ukrainienne",
  UY: "Uruguayenne",
  VE: "Venezuelienne",
  VN: "Vietnamienne",
  YE: "Yemenite",
};

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
    label:
      feminineNationalities[code] ??
      regionNames.of(code) ??
      countries[code as keyof typeof countries].name,
    flag: countryCodeToFlag(code),
  }))
  .sort((first, second) => first.label.localeCompare(second.label, "fr"));

type RequestSubmitResult = {
  ok: boolean;
  requestId?: string;
  message?: string;
  issues?: { message: string }[];
};

function submitRequestFormData(
  formData: FormData,
  onProgress: (progress: number) => void,
) {
  return new Promise<RequestSubmitResult>((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("POST", "/api/requests");
    request.responseType = "text";
    request.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.max(1, Math.round((event.loaded / event.total) * 100)));
      }
    };
    request.onload = () => {
      let result: RequestSubmitResult;

      try {
        result = JSON.parse(request.responseText || "{}") as RequestSubmitResult;
      } catch {
        result = {
          ok: false,
          message:
            request.responseText ||
            "Le serveur n'a pas retourne une reponse lisible.",
        };
      }

      if (request.status >= 200 && request.status < 300 && result.ok) {
        resolve(result);
        return;
      }

      reject(result);
    };
    request.onerror = () => {
      reject({
        ok: false,
        message: "Connexion interrompue pendant l'envoi.",
      });
    };
    request.send(formData);
  });
}

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

export type RequestFormInitialUser = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
};

export function RequestStepForm({
  type,
  initialUser,
}: {
  type: "visa" | "koupat";
  initialUser?: RequestFormInitialUser | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [personStatus, setPersonStatus] = useState("");
  const [koupatProgram, setKoupatProgram] = useState("");
  const [stepError, setStepError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitState, setSubmitState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [sendProgress, setSendProgress] = useState(0);
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);
  const isVisa = type === "visa";
  const isKoupat = type === "koupat";
  const title = type === "visa" ? "Visa etudiant" : "Koupat Holim";
  const isSubmitting = submitState.status === "loading";

  function validateStep(stepIndex: number) {
    const form = formRef.current;

    if (!form) {
      return true;
    }

    const formData = new FormData(form);
    const missing = (message: string) => {
      setStepError(message);
      return false;
    };
    const hasText = (name: string) => String(formData.get(name) ?? "").trim().length > 0;
    const hasFile = (name: string) => {
      const file = formData.get(name);
      return file instanceof File && file.size > 0;
    };

    if (stepIndex === 0) {
      if (
        !hasText("firstName") ||
        !hasText("lastName") ||
        !hasText("email") ||
        !hasText("phone") ||
        !hasText("birthDate") ||
        !hasText("nationality")
      ) {
        return missing("Completez les informations d'identite avant de continuer.");
      }
    }

    if (stepIndex === 1) {
      if ((isVisa && !hasText("personStatus")) || !hasText("passportNumber") || !hasText("school")) {
        return missing("Completez les informations du dossier avant de continuer.");
      }
    }

    if (stepIndex === 2) {
      if (
        !hasFile("passportFile") ||
        !hasFile("formFile") ||
        (isVisa && !hasFile("birthCertificateFile")) ||
        !hasFile("studentCertificateFile")
      ) {
        return missing("Ajoutez toutes les pieces demandees avant de continuer.");
      }
    }

    if (stepIndex === 3 && !acceptedTerms) {
      return missing("Vous devez accepter les conditions generales avant l'envoi.");
    }

    setStepError("");
    return true;
  }

  function goToStep(nextStep: number) {
    if (nextStep <= step) {
      setStep(nextStep);
      setStepError("");
      return;
    }

    if (validateStep(step)) {
      setStep((value) => Math.min(steps.length - 1, value + 1));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    setSubmitState({
      status: "loading",
      message: "Envoi de votre dossier en cours...",
    });
    setSendProgress(1);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await submitRequestFormData(formData, setSendProgress);

      setSendProgress(100);
      setSubmitState({
        status: "success",
        message: `Votre demande a bien ete envoyee (reference ${result.requestId}). Un email de confirmation vient de vous etre envoye. Notre equipe va etudier votre dossier et reviendra vers vous pour la suite.`,
      });
    } catch (error) {
      const result = error as RequestSubmitResult;
      setSubmitState({
        status: "error",
        message:
          result.issues?.[0]?.message ??
          result.message ??
          "Impossible d'envoyer la demande. Reessayez.",
      });
      setSendProgress(0);
    }
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
        <form className="grid gap-6" ref={formRef} onSubmit={handleSubmit} noValidate>
        <input name="kind" type="hidden" value={type} />
        <fieldset className="contents" disabled={isSubmitting}>
        <div className="grid gap-3">
          <div className="stepper-grid">
            {steps.map(({ label, detail }, index) => (
              <button
                className="step-dot"
                data-active={index === step}
                data-complete={index < step}
                key={label}
                type="button"
                onClick={() => goToStep(index)}
                disabled={isSubmitting}
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

        <div className={step === 0 ? "block" : "hidden"} data-step="0">
          <FieldGroup className="form-grid">
            <Field>
              <FieldLabel htmlFor={`${type}-first-name`}>Prenom</FieldLabel>
              <Input
                defaultValue={initialUser?.firstName ?? ""}
                id={`${type}-first-name`}
                name="firstName"
                placeholder="David"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${type}-last-name`}>Nom</FieldLabel>
              <Input
                defaultValue={initialUser?.lastName ?? ""}
                id={`${type}-last-name`}
                name="lastName"
                placeholder="Cohen"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${type}-email`}>Email</FieldLabel>
              <Input
                defaultValue={initialUser?.email ?? ""}
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
              <Input
                defaultValue={initialUser?.phone ?? ""}
                id={`${type}-phone`}
                name="phone"
                placeholder="+972 ..."
                required
              />
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
        </div>

        <div className={step === 1 ? "block" : "hidden"} data-step="1">
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
                {isKoupat ? "Type de programme" : "Yeshiva / programme Massa"}
              </FieldLabel>
              {isKoupat ? (
                <>
                <input name="school" type="hidden" value={koupatProgram} />
                <Select
                  value={koupatProgram}
                  onValueChange={(value) => setKoupatProgram(value ?? "")}
                >
                  <SelectTrigger className="h-11 w-full bg-white">
                    <SelectValue placeholder="Selectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yeshiva">Yeshiva</SelectItem>
                    <SelectItem value="massa">Massa</SelectItem>
                  </SelectContent>
                </Select>
                </>
              ) : (
                <Input
                  id={`${type}-school`}
                  name="school"
                  placeholder="Nom de la yeshiva ou du programme"
                />
              )}
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
          </FieldGroup>
        </div>

        <div className={step === 2 ? "grid gap-3" : "hidden"} data-step="2">
            {isVisa || isKoupat ? (
              <>
                <DocumentAttachmentCard
                  name="passportFile"
                  required
                  title="Photo du passeport non israelien"
                  status="missing"
                  disabled={isSubmitting}
                />
                <DocumentAttachmentCard
                  name="formFile"
                  required
                  title={
                    isVisa
                      ? "Formulaire de visa rempli"
                      : "Formulaire koupat holim rempli"
                  }
                  status="missing"
                  disabled={isSubmitting}
                />
                {isVisa && (
                  <DocumentAttachmentCard
                    name="birthCertificateFile"
                    required
                    title="Acte de naissance"
                    status="missing"
                    disabled={isSubmitting}
                  />
                )}
                <DocumentAttachmentCard
                  name="studentCertificateFile"
                  required
                  title="Certificat d'etudiant ou Massa"
                  status="missing"
                  disabled={isSubmitting}
                />
              </>
            ) : (
              <>
                <DocumentAttachmentCard disabled={isSubmitting} name="passportFile" required title="Passeport" status="missing" />
                <DocumentAttachmentCard
                  name="identityFile"
                  required
                  title="Document d'identite / visa"
                  status="missing"
                  disabled={isSubmitting}
                />
              </>
            )}
        </div>

        <div className={step === 3 ? "block" : "hidden"} data-step="3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="icon-box">
                <FileCheck className="size-4" />
              </span>
              <h3 className="text-lg font-bold text-[var(--primary)]">
                Confirmation du dossier
              </h3>
            </div>
            {(isVisa || isKoupat) && (
              <Field orientation="horizontal" className="mt-5 items-start rounded-2xl border-2 border-[var(--accent)] bg-[rgba(242,99,0,0.08)] p-4 shadow-sm">
                <input
                  name="acceptTerms"
                  type="hidden"
                  value={acceptedTerms ? "true" : "false"}
                />
                <Checkbox
                  checked={acceptedTerms}
                  className="mt-1 size-6 border-2 border-[var(--accent)] bg-white"
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
        </div>

        {stepError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-base font-semibold text-amber-950">
            {stepError}
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

        {submitState.status === "loading" && (
          <div className="grid gap-1.5">
            <Progress value={sendProgress} />
            <span className="text-sm text-[var(--muted)]">
              Envoi... {Math.round(sendProgress)}%
            </span>
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-3">
          <Button
            disabled={step === 0 || isSubmitting}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            type="button"
            variant="secondary"
          >
            <ChevronLeft />
            Retour
          </Button>
          {step < steps.length - 1 ? (
            <Button
              onClick={() => goToStep(step + 1)}
              disabled={isSubmitting}
              type="button"
            >
              Continuer
              <ChevronRight />
            </Button>
          ) : (
            <Button disabled={submitState.status === "loading"} type="submit">
              {submitState.status === "loading" ? (
                <>
                  <Spinner />
                  Envoi...
                </>
              ) : (
                <>
                  Envoyer la demande
                  <Check />
                </>
              )}
            </Button>
          )}
        </div>
        </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}
