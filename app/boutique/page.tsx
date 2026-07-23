import { PageShell } from "../components";
import { StorefrontClient } from "@/components/storefront-client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
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
  const [storefront, user] = await Promise.all([
    ensureDefaultStorefront(),
    getCurrentUser(),
  ]);
  const products = await prisma.storeProduct.findMany({
    where: { storefrontId: storefront.id, active: true },
    include: {
      variants: {
        where: { active: true },
        orderBy: [{ size: "asc" }, { cut: "asc" }],
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
  });

  return (
    <PageShell>
      <main>
        <section className="section pt-0">
          <StorefrontClient
            key={params.reservation === "ok" ? "reservation-ok" : "reservation-open"}
            initialUser={
              user
                ? {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    yeshiva: user.yeshiva,
                  }
                : null
            }
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
              variants: product.variants.map((variant) => ({
                id: variant.id,
                size: variant.size,
                cut: variant.cut,
                priceCents: variant.priceCents,
                stockQuantity: variant.stockQuantity,
              })),
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
