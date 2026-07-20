"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  sendEmail,
  storeReservationAdminEmail,
  storeReservationConfirmationEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ensureDefaultStorefront, formatStorePrice } from "@/lib/store";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function variantLabel(variant: { size: string; cut: string | null } | null) {
  if (!variant) return null;
  return [variant.size, variant.cut].filter(Boolean).join(" / ");
}

function readCartItems(formData: FormData) {
  const productIds = formData.getAll("cartProductId").map(String);
  const variantIds = formData.getAll("cartVariantId").map(String);
  const quantities = formData.getAll("cartQuantity").map((value) => Number(value));

  return productIds
    .map((productId, index) => ({
      productId,
      variantId: variantIds[index] || null,
      quantity: Number.isFinite(quantities[index]) ? quantities[index] : 0,
    }))
    .filter((item) => item.productId && item.quantity > 0);
}

export async function createStoreReservation(formData: FormData) {
  const user = await getCurrentUser();
  const storefront = await ensureDefaultStorefront();
  const customerName =
    readString(formData, "customerName") ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    user?.email ||
    "";
  const customerEmail =
    (readString(formData, "customerEmail") || user?.email || "").toLowerCase();
  const customerPhone = readString(formData, "customerPhone") || user?.phone || null;
  const yeshiva = readString(formData, "yeshiva") || user?.yeshiva || null;

  if (!storefront.active) {
    throw new Error("La boutique n’est pas ouverte aux réservations.");
  }

  if (!customerName || !customerEmail) {
    throw new Error("Nom et email obligatoires.");
  }

  const products = await prisma.storeProduct.findMany({
    where: { storefrontId: storefront.id, active: true },
    include: {
      variants: {
        where: { active: true },
      },
    },
  });
  const productsById = new Map(products.map((product) => [product.id, product]));
  const cartItems = readCartItems(formData);
  const selectedItems =
    cartItems.length > 0
      ? cartItems
          .map((item) => {
            const product = productsById.get(item.productId);
            const variant = item.variantId
              ? product?.variants.find((candidate) => candidate.id === item.variantId) ?? null
              : null;

            if (!product) return null;
            return { product, variant, quantity: item.quantity };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
      : products
          .map((product) => {
            const quantity = Number(formData.get(`quantity-${product.id}`) ?? 0);
            return {
              product,
              variant: null,
              quantity: Number.isFinite(quantity) ? quantity : 0,
            };
          })
          .filter(({ quantity }) => quantity > 0);

  if (selectedItems.length === 0) {
    throw new Error("Sélectionnez au moins un produit.");
  }

  for (const item of selectedItems) {
    if (item.quantity > 50) {
      throw new Error("Quantité trop élevée.");
    }
    if (item.product.variants.length > 0 && !item.variant) {
      throw new Error(`Sélectionnez une variante pour ${item.product.title}.`);
    }
    if (
      item.variant?.stockQuantity != null &&
      item.quantity > item.variant.stockQuantity
    ) {
      throw new Error(
        `${item.product.title} (${variantLabel(item.variant)}) n’est pas disponible dans cette quantité.`,
      );
    }
    if (
      !item.variant &&
      item.product.stockQuantity != null &&
      item.quantity > item.product.stockQuantity
    ) {
      throw new Error(`${item.product.title} n’est pas disponible dans cette quantité.`);
    }
  }

  const totalCents = selectedItems.reduce(
    (total, item) => total + item.product.priceCents * item.quantity,
    0,
  );
  const currency = selectedItems[0]?.product.currency ?? "ILS";

  const reservation = await prisma.storeReservation.create({
    data: {
      storefrontId: storefront.id,
      userId: user?.id,
      customerName,
      customerEmail,
      customerPhone,
      yeshiva,
      note: readString(formData, "note") || null,
      totalCents,
      currency,
      items: {
        create: selectedItems.map(({ product, quantity, variant }) => ({
          productId: product.id,
          productVariantId: variant?.id ?? null,
          variantLabel: variantLabel(variant),
          quantity,
          unitCents: product.priceCents,
          productTitle: product.title,
        })),
      },
    },
    include: { items: true },
  });

  if (user?.id && yeshiva && !user.yeshiva) {
    await prisma.user.update({
      where: { id: user.id },
      data: { yeshiva },
    });
  }

  const itemLines = reservation.items.map((item) => {
    const title = item.variantLabel
      ? `${item.productTitle} (${item.variantLabel})`
      : item.productTitle;

    return `${item.quantity} x ${title} - ${formatStorePrice(
      item.unitCents * item.quantity,
      reservation.currency,
    )}`;
  });
  const total = formatStorePrice(reservation.totalCents, reservation.currency);
  const adminLink = `${process.env.BETTER_AUTH_URL ?? "https://bneiyeshivot.com"}/admin/boutique`;

  const confirmationEmail = await storeReservationConfirmationEmail({
    customerName,
    total,
    items: itemLines,
  });

  await sendEmail({
    to: customerEmail,
    ...confirmationEmail,
  });

  const adminEmail =
    storefront.contactEmail ||
    (await prisma.user.findFirst({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { email: true },
    }))?.email;

  if (adminEmail) {
    const notificationEmail = await storeReservationAdminEmail({
      customerName,
      customerEmail,
      customerPhone: reservation.customerPhone,
      total,
      items: itemLines,
      link: adminLink,
    });

    await sendEmail({
      to: adminEmail,
      ...notificationEmail,
    });
  }

  revalidatePath("/admin/boutique");
  revalidatePath("/boutique");
  redirect("/boutique?reservation=ok");
}
