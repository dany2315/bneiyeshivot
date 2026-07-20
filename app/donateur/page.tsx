import Link from "next/link";
import { redirect } from "next/navigation";
import { PaymentStatus } from "@prisma/client";
import { PageShell } from "@/app/components";
import { DonorDonationsTable } from "@/components/donor-donations-table";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/donor-access";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Espace donateur",
};

function readDate(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function DonorPage({
  searchParams,
}: {
  searchParams: Promise<{ donFrom?: string; donTo?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion");
  }

  if (isAdminRole(user.role)) {
    redirect("/admin");
  }

  const params = await searchParams;
  const from = readDate(params.donFrom);
  const to = readDate(params.donTo);
  const donationDate =
    from || to
      ? {
          gte: from ?? undefined,
          lt: to ? new Date(to.getTime() + 24 * 60 * 60 * 1000) : undefined,
        }
      : undefined;
  const donations = await prisma.donation.findMany({
    where: {
      status: { not: PaymentStatus.PENDING },
      ...(donationDate
        ? {
            OR: [{ paidAt: donationDate }, { paidAt: null, createdAt: donationDate }],
          }
        : {}),
      AND: [
        {
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
      ],
    },
    include: {
      payments: { orderBy: { createdAt: "desc" } },
      receipt: true,
    },
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
                  Retrouvez vos dons, reçus de paiement et reçus fiscaux
                  disponibles rattachés à {user.email}.
                </p>
              </div>
              <Button asChild>
                <Link href="/dons">Faire un don</Link>
              </Button>
            </div>

            <DonorDonationsTable
              actionPath="/donateur"
              donations={donations}
              from={params.donFrom}
              to={params.donTo}
            />
          </div>
        </section>
      </main>
    </PageShell>
  );
}
