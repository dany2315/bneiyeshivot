import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell, StatusBadge } from "@/app/components";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fileUrl } from "@/lib/files";
import {
  formatDonationFrequency,
  formatMoney,
  paymentStatusLabels,
} from "@/lib/donations";
import { isAdminRole } from "@/lib/donor-access";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Download, ExternalLink, FileArchive, Gift, ReceiptText } from "lucide-react";

export const metadata = {
  title: "Espace donateur",
};

function metadataObject(metadata: unknown) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {};
}

function metadataText(metadata: unknown, key: string) {
  const value = metadataObject(metadata)[key];

  return typeof value === "string" ? value : null;
}

function donationTone(status: string) {
  if (status === "PAID") return "green";
  if (status === "REFUNDED" || status === "PARTIALLY_REFUNDED") return "gold";
  return "blue";
}

export default async function DonorPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion");
  }

  if (isAdminRole(user.role)) {
    redirect("/admin");
  }

  const donations = await prisma.donation.findMany({
    where: {
      OR: [
        { donorEmail: user.email },
        { userId: user.id },
        {
          metadata: {
            path: ["receiptEmail"],
            equals: user.email,
          },
        },
      ],
    },
    include: { receipt: true },
    orderBy: { paidAt: "desc" },
  });

  return (
    <PageShell>
      <main>
        <section className="section">
          <div className="container">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Espace donateur</span>
                <h1 className="text-3xl font-bold text-[var(--primary)]">
                  Mes dons
                </h1>
                <p className="mt-2 max-w-2xl text-base text-[var(--muted)]">
                  Retrouvez vos dons, recus de paiement et recus Cerfa rattaches
                  a {user.email}.
                </p>
              </div>
              <Button asChild>
                <Link href="/dons">Faire un don</Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Exporter mes recus Cerfa</CardTitle>
                <CardDescription>
                  Selectionnez une plage de dates. Le ZIP contient les Cerfa PDF
                  disponibles et un index CSV.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  action="/donateur/recus/download"
                  className="grid gap-3 md:grid-cols-[180px_180px_auto]"
                  method="get"
                >
                  <Input aria-label="Date debut" name="from" type="date" />
                  <Input aria-label="Date fin" name="to" type="date" />
                  <Button className="w-fit" type="submit" variant="secondary">
                    <FileArchive className="size-4" />
                    Exporter
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="mt-5 grid gap-4">
              {donations.length === 0 ? (
                <Card>
                  <CardHeader>
                    <Gift className="size-6 text-[var(--accent)]" />
                    <CardTitle>Aucun don retrouve</CardTitle>
                    <CardDescription>
                      Aucun don n&apos;est rattache a cet email pour le moment.
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                donations.map((donation) => {
                  const stripeReceiptUrl = metadataText(
                    donation.metadata,
                    "stripeReceiptUrl",
                  );
                  const cerfaUrl = fileUrl(donation.receipt?.fileKey);

                  return (
                    <Card key={donation.id}>
                      <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <CardTitle>
                              {formatMoney(
                                donation.amountCents,
                                donation.currency,
                              )}
                            </CardTitle>
                            <CardDescription>
                              {formatDonationFrequency(
                                donation.frequency,
                                donation.recurringMonths,
                              )}{" "}
                              -{" "}
                              {(donation.paidAt ?? donation.createdAt).toLocaleDateString(
                                "fr-FR",
                              )}
                            </CardDescription>
                          </div>
                          <StatusBadge tone={donationTone(donation.status)}>
                            {paymentStatusLabels[donation.status]}
                          </StatusBadge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {stripeReceiptUrl ? (
                          <Button asChild variant="secondary">
                            <a
                              href={stripeReceiptUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              <ExternalLink className="size-4" />
                              Recu paiement
                            </a>
                          </Button>
                        ) : null}
                        {cerfaUrl ? (
                          <Button asChild variant="secondary">
                            <a href={cerfaUrl} rel="noreferrer" target="_blank">
                              <Download className="size-4" />
                              Recu Cerfa
                            </a>
                          </Button>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-bold text-[var(--muted)]">
                            <ReceiptText className="size-4" />
                            Cerfa en preparation
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
