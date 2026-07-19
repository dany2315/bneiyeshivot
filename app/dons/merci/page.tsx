import Link from "next/link";
import { CheckCircle2, ReceiptText } from "lucide-react";
import { PageShell } from "@/app/components";
import { prisma } from "@/lib/prisma";
import { formatMoney, paymentStatusLabels } from "@/lib/donations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Merci pour votre don",
};

export default async function DonationThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ donation?: string; session_id?: string }>;
}) {
  const { donation: donationId, session_id: sessionId } = await searchParams;
  const donation = donationId
    ? await prisma.donation.findUnique({
        where: { id: donationId },
        include: { payments: { orderBy: { createdAt: "desc" } }, receipt: true },
      })
    : sessionId
      ? await prisma.donation.findUnique({
          where: { stripeCheckoutSessionId: sessionId },
          include: { payments: { orderBy: { createdAt: "desc" } }, receipt: true },
        })
      : null;

  return (
    <PageShell>
      <main>
        <section className="section">
          <div className="container max-w-3xl">
            <Card className="donation-thanks-card">
              <CardHeader>
                <CheckCircle2 className="size-10 text-[var(--success)]" />
                <CardTitle>Merci pour votre soutien</CardTitle>
                <CardDescription>
                  Votre don est enregistre. La confirmation finale du paiement
                  est synchronisee automatiquement.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {donation && (
                  <div className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-4">
                    <strong>
                      {formatMoney(donation.amountCents, donation.currency)}
                    </strong>
                    <span className="text-sm text-[var(--muted)]">
                      Statut: {paymentStatusLabels[donation.status]}
                    </span>
                    {donation.receiptNeeded ? (
                      <span className="flex items-center gap-2 text-sm text-[var(--primary)]">
                        <ReceiptText className="size-4" />
                        Recu Cerfa demande
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-sm text-[var(--primary)]">
                        <ReceiptText className="size-4" />
                        Recu fiscal non applicable pour ce paiement
                      </span>
                    )}
                    {donation.payments[0]?.installmentNumber ? (
                      <span className="text-sm text-[var(--muted)]">
                        Paiement: {donation.payments[0].installmentNumber} /{" "}
                        {donation.payments[0].installmentTotal ?? "sans limite"}
                      </span>
                    ) : null}
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/">Retour a l&apos;accueil</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/dons">Faire un autre don</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
