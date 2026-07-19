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
    throw new Error("La boutique n'est pas ouverte aux reservations.");
  }

  if (!customerName || !customerEmail) {
    throw new Error("Nom et email obligatoires.");
  }

  const products = await prisma.storeProduct.findMany({
    where: { storefrontId: storefront.id, active: true },
  });
  const selectedItems = products
    .map((product) => {
      const quantity = Number(formData.get(`quantity-${product.id}`) ?? 0);
      return { product, quantity: Number.isFinite(quantity) ? quantity : 0 };
    })
    .filter(({ quantity }) => quantity > 0);

  if (selectedItems.length === 0) {
    throw new Error("Selectionnez au moins un produit.");
  }

  for (const item of selectedItems) {
    if (item.quantity > 50) {
      throw new Error("Quantite trop elevee.");
    }
    if (
      item.product.stockQuantity != null &&
      item.quantity > item.product.stockQuantity
    ) {
      throw new Error(`${item.product.title} n'est pas disponible dans cette quantite.`);
    }
  }

  const totalCents = selectedItems.reduce(
    (total, item) => total + item.product.priceCents * item.quantity,
    0,
  );
  const currency = selectedItems[0]?.product.currency ?? "EUR";

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
        create: selectedItems.map(({ product, quantity }) => ({
          productId: product.id,
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

  const itemLines = reservation.items.map(
    (item) =>
      `${item.quantity} x ${item.productTitle} - ${formatStorePrice(
        item.unitCents * item.quantity,
        reservation.currency,
      )}`,
  );
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
