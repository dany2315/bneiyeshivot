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
      title: string;
      active: boolean;
      variants: Map<
        string,
        {
          productVariantId: string | null;
          variantLabel: string | null;
          orderedQuantity: number;
          stockQuantity: number | null;
          active: boolean;
        }
      >;
    }
  >();

  for (const product of products) {
    const variants = new Map<
      string,
      {
        productVariantId: string | null;
        variantLabel: string | null;
        orderedQuantity: number;
        stockQuantity: number | null;
        active: boolean;
      }
    >();

    if (product.variants.length === 0) {
      variants.set("base", {
        productVariantId: null,
        variantLabel: "Produit",
        orderedQuantity: 0,
        stockQuantity: product.stockQuantity,
        active: product.active,
      });
    } else {
      for (const variant of product.variants) {
        variants.set(variant.id, {
          productVariantId: variant.id,
          variantLabel: [variant.size, variant.cut].filter(Boolean).join(" / "),
          orderedQuantity: 0,
          stockQuantity: variant.stockQuantity,
          active: product.active && variant.active,
        });
      }
    }

    supplyByProduct.set(product.id, {
      productId: product.id,
      title: product.title,
      active: product.active,
      variants,
    });
  }

  function supplyKey(item: {
    productVariantId?: string | null;
  }) {
    return item.productVariantId ?? "base";
  }

  for (const reservation of reservations) {
    if (!openSupplyStatuses.includes(reservation.status)) {
      continue;
    }

    for (const item of reservation.items) {
      const key = supplyKey(item);
      const currentProduct =
        supplyByProduct.get(item.productId) ??
        {
          productId: item.productId,
          title: item.productTitle,
          active: false,
          variants: new Map(),
        };
      const currentVariant =
        currentProduct.variants.get(key) ??
        {
          productVariantId: item.productVariantId,
          variantLabel: item.variantLabel,
          orderedQuantity: 0,
          stockQuantity: null,
          active: false,
        };

      currentVariant.orderedQuantity += item.quantity;
      currentProduct.variants.set(key, currentVariant);
      supplyByProduct.set(item.productId, currentProduct);
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
            priceCents: variant.priceCents,
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
          receptionMode: reservation.receptionMode,
          deliveryAddress: reservation.deliveryAddress,
          paid: reservation.paid,
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
          .map((product) => {
            const variants = Array.from(product.variants.values())
              .map((variant) => ({
                ...variant,
                missingQuantity:
                  variant.stockQuantity == null
                    ? null
                    : Math.max(0, variant.orderedQuantity - variant.stockQuantity),
              }))
              .filter(
                (variant) =>
                  variant.orderedQuantity > 0 &&
                  (variant.missingQuantity == null || variant.missingQuantity > 0),
              )
              .sort((a, b) => {
                if (a.missingQuantity == null && b.missingQuantity != null) return -1;
                if (a.missingQuantity != null && b.missingQuantity == null) return 1;
                return b.orderedQuantity - a.orderedQuantity;
              });

            return {
              productId: product.productId,
              title: product.title,
              active: product.active,
              variants,
              orderedQuantity: variants.reduce(
                (total, variant) => total + variant.orderedQuantity,
                0,
              ),
              missingQuantity: variants.some((variant) => variant.missingQuantity == null)
                ? null
                : variants.reduce(
                    (total, variant) => total + (variant.missingQuantity ?? 0),
                    0,
                  ),
            };
          })
          .filter((product) => product.variants.length > 0)
          .sort((a, b) => {
            if (a.missingQuantity == null && b.missingQuantity != null) return -1;
            if (a.missingQuantity != null && b.missingQuantity == null) return 1;
            return (b.missingQuantity ?? 0) - (a.missingQuantity ?? 0);
          })}
      />
    </AdminShell>
  );
}
