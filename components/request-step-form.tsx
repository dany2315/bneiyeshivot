"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck,
  Flag,
} from "lucide-react";
import { DocumentAttachmentCard } from "@/components/document-attachment-card";
import { PhoneInputGroup } from "@/components/phone-input-group";
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
  { label: "Identité", detail: "Coordonnées" },
  { label: "Dossier", detail: "Informations" },
  { label: "Documents", detail: "Pièces" },
  { label: "Validation", detail: "Envoi" },
];

const regionNames = new Intl.DisplayNames(["fr"], { type: "region" });

const feminineNationalities: Record<string, string> = {
  AF: "Afghane",
  AL: "Albanaise",
  DZ: "Algérienne",
  DE: "Allemande",
  AD: "Andorrane",
  AO: "Angolaise",
  AR: "Argentine",
  AM: "Arménienne",
  AU: "Australienne",
  AT: "Autrichienne",
  AZ: "Azerbaïdjanaise",
  BE: "Belge",
  BJ: "Béninoise",
  BA: "Bosnienne",
  BR: "Brésilienne",
  BG: "Bulgare",
  BF: "Burkinabè",
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
  KR: "Sud-coréenne",
  KP: "Nord-coréenne",
  CI: "Ivoirienne",
  HR: "Croate",
  CU: "Cubaine",
  DK: "Danoise",
  EG: "Égyptienne",
  AE: "Émirienne",
  EC: "Équatorienne",
  ES: "Espagnole",
  EE: "Estonienne",
  US: "Américaine",
  ET: "Éthiopienne",
  FI: "Finlandaise",
  FR: "Française",
  GA: "Gabonaise",
  GM: "Gambienne",
  GE: "Géorgienne",
  GH: "Ghanéenne",
  GR: "Grecque",
  GN: "Guinéenne",
  HT: "Haïtienne",
  HU: "Hongroise",
  IN: "Indienne",
  ID: "Indonésienne",
  IR: "Iranienne",
  IQ: "Irakienne",
  IE: "Irlandaise",
  IL: "Israélienne",
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
  MC: "Monégasque",
  MN: "Mongole",
  ME: "Monténégrine",
  MZ: "Mozambicaine",
  NL: "Néerlandaise",
  NE: "Nigérienne",
  NG: "Nigériane",
  NO: "Norvégienne",
  NZ: "Néo-zélandaise",
  PK: "Pakistanaise",
  PS: "Palestinienne",
  PE: "Péruvienne",
  PH: "Philippine",
  PL: "Polonaise",
  PT: "Portugaise",
  QA: "Qatarienne",
  RO: "Roumaine",
  GB: "Britannique",
  RU: "Russe",
  RW: "Rwandaise",
  SA: "Saoudienne",
  SN: "Sénégalaise",
  RS: "Serbe",
  SG: "Singapourienne",
  SK: "Slovaque",
  SI: "Slovène",
  SO: "Somalienne",
  SD: "Soudanaise",
  SE: "Suédoise",
  CH: "Suisse",
  SY: "Syrienne",
  TD: "Tchadienne",
  CZ: "Tchèque",
  TH: "Thaïlandaise",
  TN: "Tunisienne",
  TR: "Turque",
  UA: "Ukrainienne",
  UY: "Uruguayenne",
  VE: "Vénézuélienne",
  VN: "Vietnamienne",
  YE: "Yéménite",
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

type PresignedUpload = {
  fieldName: string;
  label: string;
  fileKey: string;
  mimeType: string;
  uploadUrl: string;
};

type UploadedDocument = {
  fieldName: string;
  label: string;
  fileKey: string;
  mimeType: string;
  originalName: string;
};

const documentLabels: Record<string, string> = {
  passportFile: "Photo du passeport non israélien",
  formFile: "Formulaire rempli",
  birthCertificateFile: "Acte de naissance",
  studentCertificateFile: "Certificat d’étudiant ou Massa",
  identityFile: "Document d’identité / visa",
};

const koupatFormDownloads = [
  {
    label: "Formulaire Meuhedet en français",
    href: "/formulaires/formulaire-meuhedet-francais.pdf",
  },
  {
    label: "Formulaire Meuhedet en hébreu",
    href: "/formulaires/formulaire-meuhedet-hebreu.pdf",
  },
  {
    label: "Formulaire Meuhedet en anglais",
    href: "/formulaires/formulaire-meuhedet-anglais.pdf",
  },
] as const;

const visaFormDownloads = [
  {
    label: "Formulaire visa étudiant",
    href: "/formulaires/formulaire-visa.pdf",
  },
] as const;

function putFileToS3(
  upload: PresignedUpload,
  file: File,
  onProgress: (loaded: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("PUT", upload.uploadUrl);
    request.responseType = "text";
    request.setRequestHeader("Content-Type", upload.mimeType);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded);
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }

      reject(new Error("Upload S3 refusé."));
    };
    request.onerror = () => {
      reject(new Error("Connexion interrompue pendant l’upload."));
    };
    request.send(file);
  });
}

async function createRequestPayload(
  payload: Record<string, unknown>,
): Promise<RequestSubmitResult> {
  const response = await fetch("/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = (await response.json().catch(() => ({
    ok: false,
    message: "Le serveur n’a pas retourné une réponse lisible.",
  }))) as RequestSubmitResult;

  if (!response.ok || !result.ok) {
    throw result;
  }

  return result;
}

function FormDownloadCard({
  forms,
}: {
  forms: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div className="grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--subtle)] p-4">
      <div>
        <strong className="text-base text-[var(--primary)]">
          Formulaire à remplir
        </strong>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Téléchargez le formulaire, remplissez-le, puis uploadez le fichier
          complété juste en dessous.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {forms.map((form) => (
          <Button asChild key={form.href} size="sm" type="button" variant="secondary">
            <a href={form.href} download>
              <Download className="size-4" />
              {form.label}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
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
            "Sélectionner la nationalité"
          )}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[9999] grid gap-2 rounded-2xl border border-[var(--border)] bg-white p-2.5 shadow-[0_22px_60px_rgba(6,40,70,0.16)]">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une nationalité..."
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
  parentPhone?: string | null;
};

export function RequestStepForm({
  adminMode = false,
  type,
  initialUser,
}: {
  adminMode?: boolean;
  type: "visa" | "koupat";
  initialUser?: RequestFormInitialUser | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isFirstStepRender = useRef(true);
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
  const [fileUploadProgress, setFileUploadProgress] = useState<Record<string, number>>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Record<string, UploadedDocument>
  >({});
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  // À chaque changement d'étape (Continuer, Retour ou clic sur le stepper),
  // on ramène l'utilisateur en haut du formulaire plutôt que de conserver la
  // position de défilement, qui laissait souvent voir le bas de l'étape.
  useEffect(() => {
    if (isFirstStepRender.current) {
      isFirstStepRender.current = false;
      return;
    }

    const node = formRef.current;

    if (!node || typeof window === "undefined") {
      return;
    }

    const headerOffset = 90;
    const top = window.scrollY + node.getBoundingClientRect().top - headerOffset;

    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [step]);

  const isVisa = type === "visa";
  const isKoupat = type === "koupat";
  const title = type === "visa" ? "Visa étudiant" : "Koupat Holim";
  const isSubmitting = submitState.status === "loading";
  const isUploadingDocuments = Object.values(uploadingFields).some(Boolean);
  const successTitle = isVisa
    ? "Demande de visa envoyée"
    : "Demande Koupat Holim envoyée";

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
    const hasUploadedFile = (name: string) => Boolean(uploadedDocuments[name]);

    if (stepIndex === 0) {
      if (
        !hasText("firstName") ||
        !hasText("lastName") ||
        !hasText("email") ||
        !hasText("phone") ||
        !hasText("parentPhone") ||
        !hasText("birthDate") ||
        !hasText("nationality")
      ) {
        return missing("Complétez les informations d’identité avant de continuer.");
      }
    }

    if (stepIndex === 1) {
      if ((isVisa && !hasText("personStatus")) || !hasText("passportNumber") || !hasText("school")) {
        return missing("Complétez les informations du dossier avant de continuer.");
      }
    }

    if (stepIndex === 2) {
      if (
        !hasUploadedFile("passportFile") ||
        !hasUploadedFile("formFile") ||
        (isVisa && !hasUploadedFile("birthCertificateFile")) ||
        !hasUploadedFile("studentCertificateFile")
      ) {
        return missing("Ajoutez toutes les pièces demandées avant de continuer.");
      }

      if (isUploadingDocuments) {
        return missing("Attendez la fin de l’upload des pièces avant de continuer.");
      }
    }

    if (stepIndex === 3 && !acceptedTerms) {
      return missing("Vous devez accepter les conditions générales avant l’envoi.");
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

  async function deleteUploadedDocument(fieldName: string) {
    const current = uploadedDocuments[fieldName];

    if (!current) {
      return;
    }

    setUploadedDocuments((documents) => {
      const next = { ...documents };
      delete next[fieldName];
      return next;
    });
    setFileUploadProgress((progressByField) => {
      const next = { ...progressByField };
      delete next[fieldName];
      return next;
    });

    await fetch("/api/requests/upload-url", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: type, fileKey: current.fileKey }),
    }).catch(() => undefined);
  }

  async function handleDocumentFileChange(
    fieldName: string,
    label: string,
    file: File | null,
  ) {
    setStepError("");

    if (!file) {
      await deleteUploadedDocument(fieldName);
      return;
    }

    await deleteUploadedDocument(fieldName);
    setUploadingFields((current) => ({ ...current, [fieldName]: true }));
    setFileUploadProgress((current) => ({ ...current, [fieldName]: 1 }));

    try {
      const presignResponse = await fetch("/api/requests/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: type,
          files: [
            {
              fieldName,
              label,
              fileName: file.name,
              mimeType: file.type || "application/octet-stream",
              size: file.size,
            },
          ],
        }),
      });
      const presignResult = (await presignResponse.json().catch(() => ({
        ok: false,
        message: "Impossible de préparer l’upload du document.",
      }))) as {
        ok: boolean;
        message?: string;
        uploads?: PresignedUpload[];
      };
      const upload = presignResult.uploads?.[0];

      if (!presignResponse.ok || !presignResult.ok || !upload) {
        throw new Error(
          presignResult.message ?? "Impossible de préparer l’upload du document.",
        );
      }

      await putFileToS3(upload, file, (loaded) => {
        setFileUploadProgress((current) => ({
          ...current,
          [fieldName]: Math.max(1, Math.round((loaded / file.size) * 100)),
        }));
      });

      setUploadedDocuments((documents) => ({
        ...documents,
        [fieldName]: {
          fieldName,
          label,
          fileKey: upload.fileKey,
          mimeType: upload.mimeType,
          originalName: file.name,
        },
      }));
      setFileUploadProgress((current) => ({ ...current, [fieldName]: 100 }));
    } catch (error) {
      setStepError(
        error instanceof Error
          ? error.message
          : "Impossible d’uploader le document.",
      );
      setFileUploadProgress((current) => {
        const next = { ...current };
        delete next[fieldName];
        return next;
      });
    } finally {
      setUploadingFields((current) => ({ ...current, [fieldName]: false }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateStep(2) || !validateStep(3)) {
      return;
    }

    setSubmitState({
      status: "loading",
      message: "Envoi de votre dossier en cours...",
    });
    setSendProgress(1);

    try {
      const formData = new FormData(event.currentTarget);
      const payload = Object.fromEntries(
        Array.from(formData.entries()).filter(([, value]) => !(value instanceof File)),
      );
      setSendProgress(80);
      const result = await createRequestPayload({
        ...payload,
        documents: Object.values(uploadedDocuments).map(
          ({ label, fileKey, mimeType }) => ({
            label,
            fileKey,
            mimeType,
          }),
        ),
      });

      setSendProgress(100);
      setSubmitState({
        status: "success",
        message: adminMode
          ? `Demande créée avec succès (référence ${result.requestId}). Le dossier apparaît dans la liste admin et l’utilisateur a été notifié par email.`
          : `Votre demande a bien été envoyée (référence ${result.requestId}). Un email de confirmation vient de vous être envoyé. Notre équipe va étudier votre dossier et reviendra vers vous pour la suite.`,
      });
      router.refresh();
    } catch (error) {
      const result = error as RequestSubmitResult;
      setSubmitState({
        status: "error",
        message:
          result.issues?.[0]?.message ??
          result.message ??
          "Impossible d’envoyer la demande. Réessayez.",
      });
      setSendProgress(0);
      setFileUploadProgress({});
    }
  }

  if (submitState.status === "success") {
    return (
      <Card className="relative z-20 max-w-[760px] overflow-hidden">
        <CardContent className="grid gap-6 p-7 text-center sm:p-9">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="size-8" />
          </div>
          <div className="grid gap-2">
            <CardTitle className="text-2xl">{successTitle}</CardTitle>
            <CardDescription className="mx-auto max-w-[560px] text-base leading-7">
              {submitState.message}
            </CardDescription>
          </div>
          <div className="mx-auto grid w-full max-w-[420px] gap-3 sm:grid-cols-2">
            <Button asChild variant="secondary">
              <Link href="/">Accueil</Link>
            </Button>
            <Button asChild>
              <Link href="/client">Mon espace</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative z-20 max-w-[760px] overflow-visible">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {isVisa
            ? "Formulaire de demande de visa étudiant avec les informations et pièces demandées."
            : "Formulaire de demande Koupat Holim avec les informations et pièces demandées."}
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
              <FieldLabel htmlFor={`${type}-first-name`}>Prénom</FieldLabel>
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
              <FieldLabel htmlFor={`${type}-phone`}>Téléphone</FieldLabel>
              <PhoneInputGroup
                defaultValue={initialUser?.phone ?? ""}
                id={`${type}-phone`}
                name="phone"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${type}-parent-phone`}>
                Téléphone des parents
              </FieldLabel>
              <PhoneInputGroup
                autoComplete="tel"
                defaultValue={initialUser?.parentPhone ?? ""}
                id={`${type}-parent-phone`}
                name="parentPhone"
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
                    Nationalité
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
                          <SelectValue placeholder="Sélectionner le statut" />
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
                        Numéro de passeport non israélien
                      </FieldLabel>
                      <Input
                        id="koupat-passport-number"
                        name="passportNumber"
                        placeholder="Numéro du passeport"
                        required
                      />
                    </>
                  )}
                </Field>
                {isVisa && (
                  <Field>
                    <FieldLabel htmlFor="visa-passport-number">
                      Numéro de passeport non israélien
                    </FieldLabel>
                    <Input
                      id="visa-passport-number"
                      name="passportNumber"
                      placeholder="Numéro du passeport"
                      required
                    />
                  </Field>
                )}
              </>
            ) : (
              <Field>
                <FieldLabel htmlFor={`${type}-country`}>
                  Pays d’origine
                </FieldLabel>
                <Select>
                  <SelectTrigger className="h-11 w-full bg-white">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="france">France</SelectItem>
                    <SelectItem value="israel">Israël</SelectItem>
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
                    <SelectValue placeholder="Sélectionner" />
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
                  Date d’arrivée prévue
                </FieldLabel>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
                  <Input id={`${type}-arrival`} className="pl-9" type="date" />
                </div>
                <FieldDescription>
                  Champ provisoire, à confirmer avec tes données exactes.
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
                  title="Photo du passeport non israélien"
                  status="missing"
                  disabled={isSubmitting}
                  fileName={uploadedDocuments.passportFile?.originalName ?? ""}
                  onFileChange={(file) =>
                    handleDocumentFileChange(
                      "passportFile",
                      documentLabels.passportFile,
                      file,
                    )
                  }
                  uploadProgress={fileUploadProgress.passportFile}
                />
                <FormDownloadCard
                  forms={isVisa ? visaFormDownloads : koupatFormDownloads}
                />
                <DocumentAttachmentCard
                  name="formFile"
                  required
                  title={
                    isVisa
                      ? "Formulaire de visa rempli"
                      : "Formulaire Koupat Holim rempli"
                  }
                  status="missing"
                  disabled={isSubmitting}
                  fileName={uploadedDocuments.formFile?.originalName ?? ""}
                  onFileChange={(file) =>
                    handleDocumentFileChange(
                      "formFile",
                      isVisa
                        ? "Formulaire de visa rempli"
                        : "Formulaire Koupat Holim rempli",
                      file,
                    )
                  }
                  uploadProgress={fileUploadProgress.formFile}
                />
                {isVisa && (
                  <DocumentAttachmentCard
                    name="birthCertificateFile"
                    required
                    title="Acte de naissance"
                    status="missing"
                    disabled={isSubmitting}
                    fileName={uploadedDocuments.birthCertificateFile?.originalName ?? ""}
                    onFileChange={(file) =>
                      handleDocumentFileChange(
                        "birthCertificateFile",
                        documentLabels.birthCertificateFile,
                        file,
                      )
                    }
                    uploadProgress={fileUploadProgress.birthCertificateFile}
                  />
                )}
                <DocumentAttachmentCard
                  name="studentCertificateFile"
                  required
                  title="Certificat d’étudiant ou Massa"
                  status="missing"
                  disabled={isSubmitting}
                  fileName={uploadedDocuments.studentCertificateFile?.originalName ?? ""}
                  onFileChange={(file) =>
                    handleDocumentFileChange(
                      "studentCertificateFile",
                      documentLabels.studentCertificateFile,
                      file,
                    )
                  }
                  uploadProgress={fileUploadProgress.studentCertificateFile}
                />
              </>
            ) : (
              <>
                <DocumentAttachmentCard
                  disabled={isSubmitting}
                  name="passportFile"
                  required
                  title="Passeport"
                  status="missing"
                  fileName={uploadedDocuments.passportFile?.originalName ?? ""}
                  onFileChange={(file) =>
                    handleDocumentFileChange("passportFile", "Passeport", file)
                  }
                  uploadProgress={fileUploadProgress.passportFile}
                />
                <DocumentAttachmentCard
                  name="identityFile"
                  required
                  title="Document d’identité / visa"
                  status="missing"
                  disabled={isSubmitting}
                  fileName={uploadedDocuments.identityFile?.originalName ?? ""}
                  onFileChange={(file) =>
                    handleDocumentFileChange(
                      "identityFile",
                      documentLabels.identityFile,
                      file,
                    )
                  }
                  uploadProgress={fileUploadProgress.identityFile}
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
                    J’accepte les conditions générales des demandes{" "}
                    {isVisa ? "de visa" : "de Koupat Holim"}
                  </FieldLabel>
                  <FieldDescription>
                    Cette acceptation sera obligatoire avant l’envoi du
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
              disabled={isSubmitting || isUploadingDocuments}
              type="button"
            >
              Continuer
              <ChevronRight />
            </Button>
          ) : (
            <Button
              disabled={submitState.status === "loading" || isUploadingDocuments}
              type="submit"
            >
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
