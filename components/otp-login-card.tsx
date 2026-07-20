"use client";

import { type FormEvent, useState } from "react";
import { UserRound } from "lucide-react";
import { toast } from "sonner";
import { signOutRequest } from "@/components/auth-sign-out";
import { PhoneInputGroup } from "@/components/phone-input-group";
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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type OtpLoginCardProps = {
  audience?: "bahour" | "admin";
  initialEmail?: string;
  initialMessage?: string;
  mode?: "login" | "register";
  redirectTo?: string;
  title?: string;
  description?: string;
};

export function OtpLoginCard({
  audience = "bahour",
  initialEmail = "",
  initialMessage = "",
  mode = "login",
  redirectTo = "/client",
  title = "Connexion par code OTP",
  description = "Entre ton email pour recevoir un code de connexion temporaire.",
}: OtpLoginCardProps) {
  const [email, setEmail] = useState(initialEmail);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [state, setState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({
    status: initialMessage ? "error" : "idle",
    message: initialMessage,
  });

  async function signOutRejectedSession() {
    await signOutRequest().catch(() => undefined);
  }

  async function validateAudience() {
    const response = await fetch("/api/auth/get-session");

    if (!response.ok) {
      return false;
    }

    const session = (await response.json()) as {
      user?: {
        role?: string | null;
      };
    } | null;
    const role = session?.user?.role;
    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

    if (audience === "bahour" && isAdmin) {
      await signOutRejectedSession();
      toast.error("Ce compte est administrateur. Connecte-toi depuis l’espace admin.");
      setState({
        status: "error",
        message: "Compte admin refusé sur l’Espace Bahour.",
      });
      return false;
    }

    if (audience === "admin" && !isAdmin) {
      await signOutRejectedSession();
      toast.error("Ce compte n’a pas les droits administrateur.");
      setState({
        status: "error",
        message: "Accès admin refusé.",
      });
      return false;
    }

    return true;
  }

  async function sendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading", message: "Envoi du code..." });

    const accessResponse = await fetch("/api/auth/access-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audience,
        email,
        mode,
      }),
    });
    const accessResult = (await accessResponse.json()) as {
      allowed: boolean;
      message?: string;
      reason?: string;
    };

    if (!accessResponse.ok || !accessResult.allowed) {
      const message =
        accessResult.message ?? "Ce compte ne peut pas se connecter ici.";

      if (accessResult.reason === "register-required") {
        toast.error(message);
        window.location.href = `/inscription?email=${encodeURIComponent(email)}&error=${encodeURIComponent(message)}`;
        return;
      }

      toast.error(message);
      setState({
        status: "error",
        message,
      });
      return;
    }

    const response = await fetch("/api/auth/email-otp/send-verification-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        type: "sign-in",
      }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setState({
        status: "error",
        message:
          result?.message ?? "Impossible d’envoyer le code pour le moment.",
      });
      return;
    }

    setStep("otp");
    setState({
      status: "success",
      message: "Code envoyé. Vérifie ta boîte email.",
    });
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading", message: "Vérification du code..." });

    const response = await fetch("/api/auth/sign-in/email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        otp,
        name:
          mode === "register"
            ? `${firstName} ${lastName}`.trim()
            : email,
        firstName: mode === "register" ? firstName : undefined,
        lastName: mode === "register" ? lastName : undefined,
        phone: mode === "register" ? phone : undefined,
      }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setState({
        status: "error",
        message: result?.message ?? "Code invalide ou expiré.",
      });
      return;
    }

    const canContinue = await validateAudience();

    if (!canContinue) {
      return;
    }

    setState({
      status: "success",
      message: "Connexion réussie. Redirection...",
    });
    toast.success("Connexion réussie.");

    if (redirectTo === "auto") {
      const destinationResponse = await fetch("/api/auth/resolve-destination");
      const destinationResult = (await destinationResponse.json().catch(() => null)) as {
        destination?: string;
      } | null;
      window.location.href = destinationResult?.destination ?? "/client";
      return;
    }

    window.location.href = redirectTo;
  }

  return (
    <Card className="border-[var(--border)] bg-white/95 shadow-[0_24px_70px_rgba(6,40,70,0.08)]">
      <CardHeader className="gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--subtle)] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          <UserRound className="size-4 text-[var(--primary)]" />
          Code sécurisé
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" ? (
          <form className="grid gap-3" onSubmit={sendOtp}>
            {mode === "register" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  autoComplete="given-name"
                  name="firstName"
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Prénom"
                  required
                  value={firstName}
                />
                <Input
                  autoComplete="family-name"
                  name="lastName"
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Nom"
                  required
                  value={lastName}
                />
              </div>
            )}
            <Input
              autoComplete="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@exemple.com"
              required
              type="email"
              value={email}
            />
            {mode === "register" && (
              <PhoneInputGroup
                autoComplete="tel"
                defaultValue={phone}
                id="register-phone"
                name="phone"
                onValueChange={setPhone}
                required
              />
            )}
            <Button disabled={state.status === "loading"} type="submit">
              Recevoir mon code
            </Button>
          </form>
        ) : (
          <form className="grid gap-4" onSubmit={verifyOtp}>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--subtle)] p-4">
              <p className="text-sm font-semibold text-[var(--muted)]">
                Code envoyé à
              </p>
              <p className="mt-1 break-all text-base font-bold text-[var(--primary)]">
                {email}
              </p>
            </div>
            <InputOTP maxLength={6} onChange={setOtp} value={otp}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    className="size-11 text-base"
                    index={index}
                    key={index}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <div className="flex flex-wrap gap-2">
              <Button disabled={state.status === "loading" || otp.length < 6} type="submit">
                Valider le code
              </Button>
              <Button
                onClick={() => {
                  setOtp("");
                  setStep("email");
                }}
                type="button"
                variant="secondary"
              >
                Changer d’email
              </Button>
            </div>
          </form>
        )}

        {state.status !== "idle" && (
          <p
            className={
              state.status === "error"
                ? "mt-4 text-base text-red-700"
                : "mt-4 text-base text-[var(--muted)]"
            }
          >
            {state.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
