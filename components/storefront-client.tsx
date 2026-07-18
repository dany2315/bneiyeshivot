"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Minus, Plus, ShoppingBag } from "lucide-react";
import { createStoreReservation } from "@/app/boutique/actions";
import { StoreProductImageDialog } from "@/components/store-product-image-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

type StorefrontView = {
  active: boolean;
  description: string;
  name: string;
  pickupDetails: string | null;
};

type ProductView = {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  imageUrls: string[];
  stockQuantity: number | null;
  featured: boolean;
};

function formatPrice(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function StorefrontClient({
  products,
  reservationOk,
  storefront,
}: {
  products: ProductView[];
  reservationOk: boolean;
  storefront: StorefrontView;
}) {
  const [quantities, setQuantities] = useProductQuantities(products);
  const cartItems = products
    .map((product) => ({
      product,
      quantity: quantities[product.id] ?? 0,
    }))
    .filter((item) => item.quantity > 0);
  const totalCents = cartItems.reduce(
    (total, item) => total + item.product.priceCents * item.quantity,
    0,
  );
  const currency = cartItems[0]?.product.currency ?? "EUR";

  function setQuantity(productId: string, quantity: number) {
    const product = products.find((item) => item.id === productId);
    const max = Math.min(50, product?.stockQuantity ?? 50);
    setQuantities((current) => ({
      ...current,
      [productId]: Math.max(0, Math.min(max, quantity)),
    }));
  }

  return (
    <>
      <div className="sticky top-[74px] z-20 border-b border-[var(--border)] bg-white/92 shadow-sm backdrop-blur">
        <div className="container flex min-h-16 items-center justify-between gap-4">
          <div className="min-w-0">
            <strong className="block truncate text-base text-[var(--primary)]">
              {storefront.name}
            </strong>
            <small className="block truncate text-[var(--muted)]">
              Reservation sans paiement
            </small>
          </div>
          <CartSheet
            cartItems={cartItems}
            currency={currency}
            products={products}
            quantities={quantities}
            storefront={storefront}
            totalCents={totalCents}
          />
        </div>
      </div>

      <div className="container grid gap-4 pt-5">
        {reservationOk ? (
          <Alert className="border-green-200 bg-green-50 text-green-950">
            <CheckCircle2 className="size-4" />
            <AlertTitle>Reservation envoyee</AlertTitle>
            <AlertDescription>
              Nous avons bien recu votre reservation. L&apos;equipe vous
              recontactera pour confirmer la disponibilite.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">{storefront.name}</span>
            <h2 className="mt-2 text-3xl font-semibold">Choisissez vos produits</h2>
            <p className="mt-2 max-w-2xl text-base text-[var(--muted)]">
              {storefront.description}
            </p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-5">
            {products.map((product) => (
              <Card className="overflow-hidden" key={product.id}>
                <StoreProductImageDialog
                  imageUrl={product.imageUrl}
                  imageUrls={product.imageUrls}
                  title={product.title}
                />
                <CardHeader className="gap-2 px-3 py-2 md:px-4 md:py-3">
                  {product.featured ? (
                    <Badge className="w-fit" variant="success">Recommande</Badge>
                  ) : null}
                  <CardTitle className="text-base md:text-lg">
                    <Link href={`/boutique/${product.slug}`}>
                      {product.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 px-3 pb-2 pt-0 md:flex-row md:items-center md:justify-between md:px-4 md:pb-3 md:pt-0">
                  <strong className="text-base text-[var(--primary)] md:text-xl">
                    {formatPrice(product.priceCents, product.currency)}
                  </strong>
                  <QuantityControl
                    onChange={(quantity) => setQuantity(product.id, quantity)}
                    quantity={quantities[product.id] ?? 0}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Boutique en preparation</CardTitle>
              <CardDescription>
                Les produits seront bientot disponibles a la reservation.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </>
  );
}

function CartSheet({
  cartItems,
  currency,
  products,
  quantities,
  storefront,
  totalCents,
}: {
  cartItems: Array<{ product: ProductView; quantity: number }>;
  currency: string;
  products: ProductView[];
  quantities: Record<string, number>;
  storefront: StorefrontView;
  totalCents: number;
}) {
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger render={<Button className="shadow-lg" />}>
        <ShoppingBag className="size-4" />
        Panier
        {itemCount > 0 ? ` (${itemCount})` : ""}
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Panier de reservation</SheetTitle>
          <SheetDescription>
            Aucun paiement en ligne. L&apos;equipe confirme ensuite.
          </SheetDescription>
        </SheetHeader>
        <form action={createStoreReservation} className="grid gap-4 px-4 pb-4">
          {products.map((product) => (
            <input
              key={product.id}
              name={`quantity-${product.id}`}
              type="hidden"
              value={quantities[product.id] ?? 0}
            />
          ))}

          <div className="grid gap-2">
            {cartItems.length > 0 ? (
              cartItems.map(({ product, quantity }) => (
                <div
                  className="flex items-start justify-between gap-3 rounded-lg border border-[var(--border)] p-3"
                  key={product.id}
                >
                  <span>
                    <strong className="block">{product.title}</strong>
                    <small className="text-[var(--muted)]">
                      {quantity} x {formatPrice(product.priceCents, product.currency)}
                    </small>
                  </span>
                  <strong className="text-[var(--primary)]">
                    {formatPrice(product.priceCents * quantity, product.currency)}
                  </strong>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-[var(--subtle)] p-3 text-sm text-[var(--muted)]">
                Ajoutez des produits depuis la liste.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
            <span className="font-bold text-[var(--primary)]">Total indicatif</span>
            <strong className="text-xl text-[var(--primary)]">
              {formatPrice(totalCents, currency)}
            </strong>
          </div>

          <Input name="customerName" placeholder="Nom et prenom" required />
          <Input name="customerEmail" placeholder="Email" required type="email" />
          <Input name="customerPhone" placeholder="Telephone" />
          <Input name="yeshiva" placeholder="Yeshiva" />
          <Input name="arrivalDate" type="date" aria-label="Date d'arrivee" />
          <Textarea
            name="note"
            placeholder="Note pour l'equipe : livraison, adresse, besoin particulier..."
          />

          {storefront.pickupDetails ? (
            <p className="rounded-lg bg-[var(--subtle)] p-3 text-sm text-[var(--muted)]">
              {storefront.pickupDetails}
            </p>
          ) : null}

          <Button
            disabled={!storefront.active || products.length === 0 || cartItems.length === 0}
          >
            <ShoppingBag className="size-4" />
            Envoyer la reservation
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function useProductQuantities(products: ProductView[]) {
  const initial = Object.fromEntries(products.map((product) => [product.id, 0]));
  return useState<Record<string, number>>(initial);
}

function QuantityControl({
  onChange,
  quantity,
}: {
  onChange: (quantity: number) => void;
  quantity: number;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-white p-1">
      <Button
        aria-label="Retirer"
        onClick={() => onChange(quantity - 1)}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <Minus className="size-3" />
      </Button>
      <Input
        className="h-8 w-12 border-0 p-0 text-center"
        min="0"
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        type="number"
        value={quantity}
      />
      <Button
        aria-label="Ajouter"
        onClick={() => onChange(quantity + 1)}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
}
