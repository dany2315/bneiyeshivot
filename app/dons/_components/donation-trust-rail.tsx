import {
  Banknote,
  LockKeyhole,
  MailCheck,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Paiement sécurisé",
    text: "Le paiement est traité sur une page sécurisée, avec carte bancaire et protection 3D Secure si nécessaire.",
  },
  {
    icon: ReceiptText,
    title: "Reçu fiscal automatique",
    text: "Le Cerfa est rattaché au don confirmé et envoyé avec l’email de remerciement.",
  },
  {
    icon: MailCheck,
    title: "Confirmation immediate",
    text: "Vous recevez une confirmation par email après validation du paiement.",
  },
  {
    icon: RefreshCcw,
    title: "Suivi en cas de besoin",
    text: "L’équipe peut retrouver le don, le reçu et le paiement depuis l’espace admin.",
  },
  {
    icon: Banknote,
    title: "Dons ponctuels ou mensuels",
    text: "Vous choisissez librement un don unique ou récurrent pour la durée souhaitée.",
  },
];

export function DonationTrustRail() {
  return (
    <aside className="grid gap-4 xl:sticky xl:top-24">
      <Card className="border-[var(--border)] bg-white/95 shadow-[0_24px_70px_rgba(6,40,70,0.08)]">
        <CardHeader>
          <Badge variant="success" className="mb-2 w-fit gap-2 px-3 py-2">
            <LockKeyhole className="size-4" />
            Paiement sécurisé
          </Badge>
          <CardTitle>Don simple et sécurisé</CardTitle>
          <CardDescription>
            Votre don est confirmé par email et votre reçu fiscal est préparé
            automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {trustItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <div className="grid gap-4" key={item.title}>
                {index > 0 && <Separator />}
                <div className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon className="size-5" />
                  </span>
                  <div className="grid gap-1">
                    <strong className="text-[var(--primary)]">{item.title}</strong>
                    <span className="text-sm leading-6 text-[var(--muted)]">
                      {item.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </aside>
  );
}
