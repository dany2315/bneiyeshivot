"use client";

import { type FormEvent, useMemo, useState } from "react";
import { Check, Send } from "lucide-react";
import { PhoneInputGroup } from "@/components/phone-input-group";
import { TalmoudoLimoudFields } from "@/components/talmoudo-limoud-fields";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";

type TalmoudoSessionOption = {
  disabled?: boolean;
  id: string;
  title: string;
  dateLabel: string;
};

type TalmoudoInitialUser = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  parentPhone?: string | null;
  yeshiva?: string | null;
};

type SubmitResult = {
  ok: boolean;
  message?: string;
  issues?: { message: string }[];
};

export function TalmoudoRegistrationForm({
  sessions,
  initialUser,
  compact = false,
}: {
  sessions: TalmoudoSessionOption[];
  initialUser?: TalmoudoInitialUser | null;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const isConnected = Boolean(initialUser?.email);
  const missingFirstName = isConnected && !initialUser?.firstName;
  const missingLastName = isConnected && !initialUser?.lastName;
  const missingPhone = isConnected && !initialUser?.phone;
  const missingParentPhone = isConnected && !initialUser?.parentPhone;
  const missingYeshiva = isConnected && !initialUser?.yeshiva;
  const enabledSessions = sessions.filter((session) => !session.disabled);
  const defaultSessionId = enabledSessions[0]?.id ?? "";
  const title = compact ? "Inscription au prochain mivhan" : "Inscription Talmoudo Beyado";
  const description = useMemo(() => {
    if (sessions.length === 0) {
      return "Aucun mivhan futur pour le moment.";
    }

    if (enabledSessions.length === 0) {
      return "Les prochains mivhanim sont affiches, mais les inscriptions sont fermees.";
    }

    if (isConnected) {
      return "Completez la massehet et les 8 dapim choisis pour ce mivhan.";
    }

    return "Creez votre inscription avec vos coordonnees, votre yeshiva et les dapim choisis.";
  }, [enabledSessions.length, isConnected, sessions.length]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("loading");
    setMessage("Inscription en cours...");

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/talmoudo-beyado/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({
        ok: false,
        message: "Le serveur n'a pas retourne une reponse lisible.",
      }))) as SubmitResult;

      if (!response.ok || !result.ok) {
        throw result;
      }

      setStatus("success");
      setMessage("Inscription enregistree. Elle apparaitra dans votre espace Bahour.");
      form.reset();
    } catch (error) {
      const result = error as SubmitResult;
      setStatus("error");
      setMessage(
        result.issues?.[0]?.message ??
          result.message ??
          "Impossible d'enregistrer l'inscription.",
      );
    }
  }

  return (
    <Card className={compact ? "h-full" : "mx-auto max-w-3xl"}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-4 text-base text-[var(--muted)]">
            Les inscriptions ouvriront des que l&apos;administration aura fixe le
            prochain mivhan.
          </div>
        ) : (
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <FieldGroup className="form-grid">
              <Field>
                <FieldLabel htmlFor="talmoudo-session">Mivhan</FieldLabel>
                <NativeSelect
                  className="w-full"
                  defaultValue={defaultSessionId}
                  id="talmoudo-session"
                  name="sessionId"
                  required
                >
                  {defaultSessionId ? null : (
                    <NativeSelectOption value="">
                      Aucun mivhan ouvert a l&apos;inscription
                    </NativeSelectOption>
                  )}
                  {sessions.map((session) => (
                    <NativeSelectOption
                      disabled={session.disabled}
                      key={session.id}
                      value={session.id}
                    >
                      {session.title} - {session.dateLabel}
                      {session.disabled ? " - inscriptions fermees" : ""}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>

              {!isConnected && (
                <>
                  <Field>
                    <FieldLabel htmlFor="talmoudo-first-name">Prenom</FieldLabel>
                    <Input id="talmoudo-first-name" name="firstName" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="talmoudo-last-name">Nom</FieldLabel>
                    <Input id="talmoudo-last-name" name="lastName" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="talmoudo-email">Email</FieldLabel>
                    <Input id="talmoudo-email" name="email" required type="email" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="talmoudo-phone">Telephone</FieldLabel>
                    <PhoneInputGroup id="talmoudo-phone" name="phone" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="talmoudo-yeshiva">Yeshiva</FieldLabel>
                    <Input id="talmoudo-yeshiva" name="yeshiva" required />
                  </Field>
                </>
              )}

              {isConnected && (
                <>
                  <input name="email" type="hidden" value={initialUser?.email ?? ""} />
                  {!missingFirstName ? (
                    <input name="firstName" type="hidden" value={initialUser?.firstName ?? ""} />
                  ) : (
                    <Field>
                      <FieldLabel htmlFor="talmoudo-connected-first-name">
                        Prenom
                      </FieldLabel>
                      <Input id="talmoudo-connected-first-name" name="firstName" required />
                    </Field>
                  )}
                  {!missingLastName ? (
                    <input name="lastName" type="hidden" value={initialUser?.lastName ?? ""} />
                  ) : (
                    <Field>
                      <FieldLabel htmlFor="talmoudo-connected-last-name">
                        Nom
                      </FieldLabel>
                      <Input id="talmoudo-connected-last-name" name="lastName" required />
                    </Field>
                  )}
                  {!missingPhone ? (
                    <input name="phone" type="hidden" value={initialUser?.phone ?? ""} />
                  ) : (
                    <Field>
                      <FieldLabel htmlFor="talmoudo-connected-phone">
                        Telephone
                      </FieldLabel>
                      <PhoneInputGroup id="talmoudo-connected-phone" name="phone" required />
                    </Field>
                  )}
                  {!missingYeshiva ? (
                    <input name="yeshiva" type="hidden" value={initialUser?.yeshiva ?? ""} />
                  ) : (
                    <Field>
                      <FieldLabel htmlFor="talmoudo-connected-yeshiva">
                        Yeshiva
                      </FieldLabel>
                      <Input id="talmoudo-connected-yeshiva" name="yeshiva" required />
                    </Field>
                  )}
                </>
              )}

              {(!isConnected || missingParentPhone) && (
                <Field>
                  <FieldLabel htmlFor="talmoudo-parent-phone">
                    Telephone des parents
                  </FieldLabel>
                  <PhoneInputGroup
                    defaultValue={initialUser?.parentPhone ?? ""}
                    id="talmoudo-parent-phone"
                    name="parentPhone"
                  />
                  <FieldDescription>Champ facultatif.</FieldDescription>
                </Field>
              )}

              {isConnected && !missingParentPhone && (
                <input name="parentPhone" type="hidden" value={initialUser?.parentPhone ?? ""} />
              )}

              <TalmoudoLimoudFields />
            </FieldGroup>

            {status !== "idle" && (
              <div
                className={
                  status === "success"
                    ? "rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-base text-emerald-900"
                    : status === "error"
                      ? "rounded-xl border border-red-200 bg-red-50 p-4 text-base text-red-900"
                      : "rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-4 text-base text-[var(--primary)]"
                }
              >
                {message}
              </div>
            )}

            <Button
              disabled={status === "loading" || enabledSessions.length === 0}
              type="submit"
            >
              {status === "loading" ? (
                <>
                  <Spinner />
                  Envoi...
                </>
              ) : status === "success" ? (
                <>
                  <Check />
                  Inscription envoyee
                </>
              ) : (
                <>
                  <Send />
                  S&apos;inscrire
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
