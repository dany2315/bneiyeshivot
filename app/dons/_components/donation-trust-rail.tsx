import {
  Banknote,
  FileCheck2,
  LockKeyhole,
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
    title: "Paiement suivi",
    text: "Creation du don en base puis mise a jour par webhook Stripe.",
  },
  {
    icon: ReceiptText,
    title: "Cerfa rattache",
    text: "Le recu est lie au don exact, modifiable depuis l'admin.",
  },
  {
    icon: RefreshCcw,
    title: "Remboursement",
    text: "Les paiements Stripe peuvent etre rembourses depuis le back-office.",
  },
  {
    icon: Banknote,
    title: "Dons hors ligne",
    text: "Especes, cheque et virement peuvent etre ajoutes par l'admin.",
  },
];

export function DonationTrustRail() {
  return (
    <aside className="grid gap-4 xl:sticky xl:top-24">
      <Card className="border-[var(--border)] bg-white/95 shadow-[0_24px_70px_rgba(6,40,70,0.08)]">
        <CardHeader>
          <Badge variant="success" className="mb-2 w-fit gap-2 px-3 py-2">
            <LockKeyhole className="size-4" />
            Stripe test active
          </Badge>
          <CardTitle>Suivi transparent</CardTitle>
          <CardDescription>
            L'admin voit les dons reussis, echoues, rembourses, recurrents et
            les recus a traiter.
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

      <Card className="border-[var(--border)] bg-[var(--primary)] text-white">
        <CardHeader>
          <FileCheck2 className="size-8 text-[var(--gold)]" />
          <CardTitle>Pour le recu Cerfa</CardTitle>
          <CardDescription className="text-white/72">
            La generation PDF fiscale definitive viendra ensuite, mais toutes
            les donnees sont deja structurees et rattachees au don.
          </CardDescription>
        </CardHeader>
      </Card>
    </aside>
  );
}
