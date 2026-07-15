import { prisma } from "@/lib/prisma";

export function formatStorePrice(cents: number, currency = "EUR") {
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
        "Reserve en quelques secondes les indispensables pour ton arrivee en Israel. Aucun paiement en ligne : l'equipe confirme la disponibilite et te recontacte.",
      description:
        "Produits utiles pour l'installation des bahourim en Israel, disponibles uniquement sur reservation.",
      pickupDetails:
        "Retrait ou livraison a coordonner avec l'equipe apres validation de la reservation.",
      contactEmail: "contact@bneiyeshivot.com",
      contactPhone: "+972 53 472 7103",
    },
  });
}
