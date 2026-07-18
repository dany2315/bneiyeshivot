import { PageShell } from "../components";
import { StorefrontClient } from "@/components/storefront-client";
import { prisma } from "@/lib/prisma";
import { ensureDefaultStorefront } from "@/lib/store";

export const metadata = {
  title: "Boutique",
};

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ reservation?: string }>;
}) {
  const params = await searchParams;
  const storefront = await ensureDefaultStorefront();
  const products = await prisma.storeProduct.findMany({
    where: { storefrontId: storefront.id, active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
  });

  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Reservation sans paiement</span>
            <h1>{storefront.heroTitle}</h1>
            <p>{storefront.heroSubtitle}</p>
          </div>
        </section>

        <section className="section">
          <StorefrontClient
            products={products.map((product) => ({
              id: product.id,
              title: product.title,
              slug: product.slug,
              description: product.description,
              priceCents: product.priceCents,
              currency: product.currency,
              imageUrl: product.imageUrl,
              imageUrls: product.imageUrls,
              stockQuantity: product.stockQuantity,
              featured: product.featured,
            }))}
            reservationOk={params.reservation === "ok"}
            storefront={{
              active: storefront.active,
              description: storefront.description,
              name: storefront.name,
              pickupDetails: storefront.pickupDetails,
            }}
          />
        </section>
      </main>
    </PageShell>
  );
}
