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
