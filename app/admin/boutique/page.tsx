import { StoreReservationStatus } from "@prisma/client";
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
  const [products, reservations] = await Promise.all([
    prisma.storeProduct.findMany({
      where: { storefrontId: storefront.id },
      orderBy: [{ active: "desc" }, { featured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.storeReservation.findMany({
      where: { storefrontId: storefront.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const supplyByProduct = new Map<
    string,
    {
      productId: string;
      title: string;
      orderedQuantity: number;
      stockQuantity: number | null;
      active: boolean;
    }
  >();

  for (const product of products) {
    supplyByProduct.set(product.id, {
      productId: product.id,
      title: product.title,
      orderedQuantity: 0,
      stockQuantity: product.stockQuantity,
      active: product.active,
    });
  }

  for (const reservation of reservations) {
    if (!openSupplyStatuses.includes(reservation.status)) {
      continue;
    }

    for (const item of reservation.items) {
      const current =
        supplyByProduct.get(item.productId) ??
        {
          productId: item.productId,
          title: item.productTitle,
          orderedQuantity: 0,
          stockQuantity: null,
          active: false,
        };

      current.orderedQuantity += item.quantity;
      supplyByProduct.set(item.productId, current);
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
        }))}
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
