import { StoreReservationStatus, StoreVariantOptionType } from "@prisma/client";
import { AdminStorePageClient } from "@/components/admin-store-page-client";
import { AdminShell } from "@/components/admin-sidebar";
import { requireAdminUser } from "@/lib/session";
import { ensureDefaultStorefront } from "@/lib/store";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Admin boutique",
};

const openSupplyStatuses: StoreReservationStatus[] = [
  "SUBMITTED",
  "CONFIRMED",
  "PREPARING",
  "READY",
];

export default async function AdminStorePage() {
  await requireAdminUser();
  const storefront = await ensureDefaultStorefront();
  const [products, reservations, variantOptions] = await Promise.all([
    prisma.storeProduct.findMany({
      where: { storefrontId: storefront.id },
      include: {
        variants: {
          orderBy: [{ size: "asc" }, { cut: "asc" }],
        },
      },
      orderBy: [{ active: "desc" }, { featured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.storeReservation.findMany({
      where: { storefrontId: storefront.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.storeVariantOption.findMany({
      where: { storefrontId: storefront.id },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    }),
  ]);

  const supplyByProduct = new Map<
    string,
    {
      productId: string;
      productVariantId: string | null;
      title: string;
      variantLabel: string | null;
      orderedQuantity: number;
      stockQuantity: number | null;
      active: boolean;
    }
  >();

  for (const product of products) {
    if (product.variants.length === 0) {
      supplyByProduct.set(`${product.id}:base`, {
        productId: product.id,
        productVariantId: null,
        title: product.title,
        variantLabel: null,
        orderedQuantity: 0,
        stockQuantity: product.stockQuantity,
        active: product.active,
      });
      continue;
    }

    for (const variant of product.variants) {
      supplyByProduct.set(`${product.id}:${variant.id}`, {
        productId: product.id,
        productVariantId: variant.id,
        title: product.title,
        variantLabel: [variant.size, variant.cut].filter(Boolean).join(" / "),
        orderedQuantity: 0,
        stockQuantity: variant.stockQuantity,
        active: product.active && variant.active,
      });
    }
  }

  function supplyKey(item: {
    productId: string;
    productVariantId?: string | null;
  }) {
    return `${item.productId}:${item.productVariantId ?? "base"}`;
  }

  for (const reservation of reservations) {
    if (!openSupplyStatuses.includes(reservation.status)) {
      continue;
    }

    for (const item of reservation.items) {
      const key = supplyKey(item);
      const current =
        supplyByProduct.get(key) ??
        {
          productId: item.productId,
          productVariantId: item.productVariantId,
          title: item.productTitle,
          variantLabel: item.variantLabel,
          orderedQuantity: 0,
          stockQuantity: null,
          active: false,
        };

      current.orderedQuantity += item.quantity;
      supplyByProduct.set(key, current);
    }
  }

  return (
    <AdminShell>
      <AdminStorePageClient
        storefront={{
          id: storefront.id,
          name: storefront.name,
          heroTitle: storefront.heroTitle,
          heroSubtitle: storefront.heroSubtitle,
          description: storefront.description,
          pickupDetails: storefront.pickupDetails,
          contactEmail: storefront.contactEmail,
          contactPhone: storefront.contactPhone,
          active: storefront.active,
        }}
        products={products.map((product) => ({
          id: product.id,
          title: product.title,
          description: product.description,
          details: product.details,
          priceCents: product.priceCents,
          currency: product.currency,
          imageUrl: product.imageUrl,
          imageUrls: product.imageUrls,
          stockQuantity: product.stockQuantity,
          active: product.active,
          featured: product.featured,
          variants: product.variants.map((variant) => ({
            id: variant.id,
            size: variant.size,
            cut: variant.cut,
            stockQuantity: variant.stockQuantity,
            active: variant.active,
          })),
        }))}
        variantOptions={{
          sizes: variantOptions
            .filter((option) => option.type === StoreVariantOptionType.SIZE)
            .map((option) => ({
              id: option.id,
              label: option.label,
              active: option.active,
              sortOrder: option.sortOrder,
            })),
          cuts: variantOptions
            .filter((option) => option.type === StoreVariantOptionType.CUT)
            .map((option) => ({
              id: option.id,
              label: option.label,
              active: option.active,
              sortOrder: option.sortOrder,
            })),
        }}
        reservations={reservations.map((reservation) => ({
          id: reservation.id,
          status: reservation.status,
          customerName: reservation.customerName,
          customerEmail: reservation.customerEmail,
          customerPhone: reservation.customerPhone,
          yeshiva: reservation.yeshiva,
          arrivalDate: reservation.arrivalDate?.toISOString() ?? null,
          pickupDate: reservation.pickupDate?.toISOString() ?? null,
          pickupLocation: reservation.pickupLocation,
          unavailableItems: reservation.unavailableItems,
          note: reservation.note,
          adminNote: reservation.adminNote,
          totalCents: reservation.totalCents,
          currency: reservation.currency,
          createdAt: reservation.createdAt.toISOString(),
          items: reservation.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitCents: item.unitCents,
            productTitle: item.productTitle,
            variantLabel: item.variantLabel,
          })),
        }))}
        supplyOverview={Array.from(supplyByProduct.values())
          .map((item) => ({
            ...item,
            missingQuantity:
              item.stockQuantity == null
                ? null
                : Math.max(0, item.orderedQuantity - item.stockQuantity),
          }))
          .sort((a, b) => b.orderedQuantity - a.orderedQuantity)}
      />
    </AdminShell>
  );
}
