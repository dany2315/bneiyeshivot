import { prisma } from "@/lib/prisma";

export function formatStorePrice(cents: number, currency = "ILS") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function readStorePrice(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  return Math.round(amount * 100);
}

// Prix effectif d'une variation : son prix propre s'il est renseigné, sinon le
// prix de base du produit (cas « prix identique pour toutes les variations »).
export function variantEffectivePrice(
  basePriceCents: number,
  variantPriceCents: number | null | undefined,
) {
  return variantPriceCents ?? basePriceCents;
}

// Résume la plage de prix d'un produit selon ses variations, pour afficher
// « à partir de » lorsque les variations n'ont pas toutes le même prix.
export function productPriceSummary(product: {
  priceCents: number;
  variants: Array<{ priceCents: number | null }>;
}) {
  if (product.variants.length === 0) {
    return { min: product.priceCents, max: product.priceCents, varies: false };
  }

  const prices = product.variants.map((variant) =>
    variantEffectivePrice(product.priceCents, variant.priceCents),
  );
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return { min, max, varies: min !== max };
}

export async function ensureDefaultStorefront() {
  const existing = await prisma.storefront.findUnique({
    where: { slug: "boutique" },
  });

  if (existing) {
    return existing;
  }

  return prisma.storefront.create({
    data: {
      slug: "boutique",
      name: "Boutique Bnei Yeshivot",
      heroTitle: "Boutique literie",
      heroSubtitle:
        "Réserve en quelques secondes les indispensables pour ton arrivée en Israël. Aucun paiement en ligne : l’équipe confirme la disponibilité et te recontacte.",
      description:
        "Produits utiles pour l’installation des bahourim en Israël, disponibles uniquement sur réservation.",
      pickupDetails:
        "Retrait ou livraison à coordonner avec l’équipe après validation de la réservation.",
      contactEmail: "contact@bneiyeshivot.com",
      contactPhone: "+972 53 472 7103",
    },
  });
}
