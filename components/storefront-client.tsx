"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { createStoreReservation } from "@/app/boutique/actions";
import { PhoneInputGroup } from "@/components/phone-input-group";
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
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Textarea } from "@/components/ui/textarea";
import { fileUrl } from "@/lib/files";

type StorefrontView = {
  active: boolean;
  description: string;
  name: string;
  pickupDetails: string | null;
};

type ProductVariantView = {
  id: string;
  size: string;
  cut: string | null;
  priceCents: number | null;
  stockQuantity: number | null;
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
  variants: ProductVariantView[];
};

type CartLine = {
  key: string;
  productId: string;
  variantId: string | null;
  quantity: number;
};

const storeCartStorageKey = "bnei-store-cart";

export type StoreInitialUser = {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  yeshiva?: string | null;
};

function formatPrice(cents: number, currency = "ILS") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function variantLabel(variant: ProductVariantView | null) {
  if (!variant) return "";
  return [variant.size, variant.cut].filter(Boolean).join(" / ");
}

// Prix effectif d'une variation : son prix propre ou, à défaut, le prix de base
// du produit (cas « prix identique pour toutes les variations »).
function effectivePrice(product: ProductView, variant: ProductVariantView | null) {
  return variant?.priceCents ?? product.priceCents;
}

function priceSummary(product: ProductView) {
  if (product.variants.length === 0) {
    return { min: product.priceCents, max: product.priceCents, varies: false };
  }

  const prices = product.variants.map(
    (variant) => variant.priceCents ?? product.priceCents,
  );
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return { min, max, varies: min !== max };
}

function sizesFor(product: ProductView) {
  return Array.from(new Set(product.variants.map((variant) => variant.size)));
}

function cutsFor(product: ProductView, size: string) {
  return product.variants.filter((variant) => variant.size === size);
}

function findDefaultVariant(product: ProductView) {
  return product.variants[0] ?? null;
}

function findVariant(product: ProductView, size: string, variantId: string) {
  return (
    product.variants.find((variant) => variant.id === variantId) ??
    cutsFor(product, size)[0] ??
    findDefaultVariant(product)
  );
}

function stockLimit(product: ProductView, variant: ProductVariantView | null) {
  return Math.min(50, variant?.stockQuantity ?? product.stockQuantity ?? 50);
}

function cartLineKey(productId: string, variantId: string | null) {
  return `${productId}:${variantId ?? "base"}`;
}

function readStoredCartLines() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(storeCartStorageKey) ?? "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (line): line is CartLine =>
        typeof line?.key === "string" &&
        typeof line.productId === "string" &&
        (typeof line.variantId === "string" || line.variantId == null) &&
        Number.isFinite(line.quantity) &&
        line.quantity > 0,
    );
  } catch {
    return [];
  }
}

function storeCartLines(cartLines: CartLine[]) {
  if (typeof window === "undefined") return;

  if (cartLines.length === 0) {
    window.sessionStorage.removeItem(storeCartStorageKey);
    return;
  }

  window.sessionStorage.setItem(storeCartStorageKey, JSON.stringify(cartLines));
}

export function StorefrontClient({
  initialUser,
  products,
  reservationOk,
  storefront,
}: {
  initialUser?: StoreInitialUser | null;
  products: ProductView[];
  reservationOk: boolean;
  storefront: StorefrontView;
}) {
  const [cartLines, setCartLines] = useState<CartLine[]>(() =>
    reservationOk ? [] : readStoredCartLines(),
  );
  const [cartPulseKey, setCartPulseKey] = useState(0);
  const visibleCartLines = reservationOk ? [] : cartLines;
  const totalCents = visibleCartLines.reduce((total, line) => {
    const product = products.find((item) => item.id === line.productId);
    if (!product) return total;
    const variant = line.variantId
      ? product.variants.find((item) => item.id === line.variantId) ?? null
      : null;
    return total + effectivePrice(product, variant) * line.quantity;
  }, 0);
  const currency =
    products.find((product) => product.id === visibleCartLines[0]?.productId)?.currency ??
    "ILS";

  useEffect(() => {
    if (reservationOk) {
      storeCartLines([]);
    }
  }, [reservationOk]);

  useEffect(() => {
    if (!reservationOk) {
      storeCartLines(cartLines);
    }
  }, [cartLines, reservationOk]);

  function addToCart(product: ProductView, variantId: string | null, quantity = 1) {
    const key = cartLineKey(product.id, variantId);
    const variant = variantId
      ? product.variants.find((item) => item.id === variantId) ?? null
      : null;
    const max = stockLimit(product, variant);
    if (max < 1) return;

    setCartLines((current) => {
      const existing = current.find((line) => line.key === key);
      if (existing) {
        return current.map((line) =>
          line.key === key
            ? { ...line, quantity: Math.min(max, line.quantity + quantity) }
            : line,
        );
      }

      return [
        ...current,
        { key, productId: product.id, variantId, quantity: Math.min(max, quantity) },
      ];
    });
    setCartPulseKey((current) => current + 1);
  }

  function updateCartLine(key: string, quantity: number) {
    setCartLines((current) =>
      current
        .map((line) => {
          if (line.key !== key) return line;
          const product = products.find((item) => item.id === line.productId);
          const variant = line.variantId
            ? product?.variants.find((item) => item.id === line.variantId) ?? null
            : null;
          const max = product ? stockLimit(product, variant) : 50;

          return { ...line, quantity: Math.min(max, Math.max(1, quantity)) };
        })
        .filter((line) => line.quantity > 0),
    );
    setCartPulseKey((current) => current + 1);
  }

  function updateCartLineVariant(key: string, variantId: string | null) {
    setCartLines((current) => {
      const line = current.find((item) => item.key === key);
      if (!line) return current;

      const product = products.find((item) => item.id === line.productId);
      if (!product) return current;

      const variant = variantId
        ? product.variants.find((item) => item.id === variantId) ?? null
        : null;
      const nextKey = cartLineKey(product.id, variant?.id ?? null);
      const max = stockLimit(product, variant);
      const nextQuantity = Math.min(max, line.quantity);
      const duplicate = current.find((item) => item.key === nextKey);

      if (duplicate && duplicate.key !== key) {
        return current
          .filter((item) => item.key !== key)
          .map((item) =>
            item.key === duplicate.key
              ? { ...item, quantity: Math.min(max, item.quantity + nextQuantity) }
              : item,
          );
      }

      return current.map((item) =>
        item.key === key
          ? {
              ...item,
              key: nextKey,
              variantId: variant?.id ?? null,
              quantity: nextQuantity,
            }
          : item,
      );
    });
    setCartPulseKey((current) => current + 1);
  }

  function removeCartLine(key: string) {
    setCartLines((current) => current.filter((line) => line.key !== key));
  }

  return (
    <>
      <div className="fixed inset-x-0 top-[70px] z-20 border-b border-[var(--border)] bg-white/92 shadow-sm backdrop-blur md:top-[74px]">
        <div className="container flex min-h-16 items-center justify-between gap-4">
          <div className="min-w-0">
            <strong className="block truncate text-base text-[var(--primary)]">
              {storefront.name}
            </strong>
            <small className="block truncate text-[var(--muted)]">
              Réservation sans paiement
            </small>
          </div>
          <CartSheet
            cartLines={visibleCartLines}
            currency={currency}
            initialUser={initialUser}
            onRemoveLine={removeCartLine}
            onUpdateLine={updateCartLine}
            onUpdateLineVariant={updateCartLineVariant}
            products={products}
            pulseKey={cartPulseKey}
            storefront={storefront}
            totalCents={totalCents}
          />
        </div>
      </div>

      <div className="container grid gap-4 pt-28">
        {reservationOk ? (
          <Alert className="border-green-200 bg-green-50 text-green-950">
            <CheckCircle2 className="size-4" />
            <AlertTitle>Réservation envoyée</AlertTitle>
            <AlertDescription>
              Nous avons bien reçu votre réservation. L’équipe vous recontactera
              pour confirmer la disponibilité.
            </AlertDescription>
          </Alert>
        ) : null}

        {!storefront.active ? (
          <Alert className="border-amber-200 bg-amber-50 text-amber-950">
            <ShoppingBag className="size-4" />
            <AlertTitle>Boutique fermée</AlertTitle>
            <AlertDescription>
              Les réservations sont momentanément fermées. Vous pouvez consulter
              les produits, mais il n’est pas possible de réserver pour le moment.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Choisissez vos produits</h2>
            <p className="mt-2 max-w-2xl text-base text-[var(--muted)]">
              {storefront.description}
            </p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard
                disabled={!storefront.active}
                key={product.id}
                onAddToCart={addToCart}
                product={product}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Boutique en préparation</CardTitle>
              <CardDescription>
                Les produits seront bientôt disponibles à la réservation.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </>
  );
}

function ProductCard({
  disabled,
  onAddToCart,
  product,
}: {
  disabled?: boolean;
  onAddToCart: (product: ProductView, variantId: string | null, quantity?: number) => void;
  product: ProductView;
}) {
  const productSizes = sizesFor(product);
  return (
    <Card className="overflow-hidden py-0 transition hover:-translate-y-0.5 hover:shadow-lg">
      <StoreProductImageDialog
        imageUrl={product.imageUrl}
        imageUrls={product.imageUrls}
        title={product.title}
      />
      <CardHeader className="gap-2 px-3 py-2 md:px-4 md:py-3">
        {product.featured ? (
          <Badge className="w-fit" variant="success">
            Recommandé
          </Badge>
        ) : null}
        <CardTitle className="text-base md:text-lg">
          <Link
            className="hover:text-[var(--accent)]"
            href={`/boutique/${product.slug}`}
          >
            {product.title}
          </Link>
        </CardTitle>
        {productSizes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {productSizes.slice(0, 5).map((item) => (
              <Link
                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs font-bold text-[var(--primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href={`/boutique/${product.slug}`}
                key={item}
              >
                {item}
              </Link>
            ))}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3 px-3 pb-3 pt-0 md:px-4">
        <strong className="text-base text-[var(--primary)] md:text-xl">
          {(() => {
            const summary = priceSummary(product);
            return summary.varies ? (
              <>
                <span className="mr-1 text-xs font-bold text-[var(--muted)] md:text-sm">
                  À partir de
                </span>
                {formatPrice(summary.min, product.currency)}
              </>
            ) : (
              formatPrice(product.priceCents, product.currency)
            );
          })()}
        </strong>
        <ProductAddButton
          disabled={disabled}
          onAdd={(selectedVariantId, quantity) =>
            onAddToCart(product, selectedVariantId, quantity)
          }
          product={product}
        />
      </CardContent>
    </Card>
  );
}

function VariantSelector({
  cutOptions,
  onSizeChange,
  onVariantChange,
  productSizes,
  size,
  variantId,
}: {
  cutOptions: ProductVariantView[];
  onSizeChange: (size: string) => void;
  onVariantChange: (variantId: string) => void;
  productSizes: string[];
  size: string;
  variantId: string;
}) {
  const hasCuts = cutOptions.some((variant) => Boolean(variant.cut));

  return (
    <div className="grid gap-2">
      <label className="grid gap-1 text-xs font-bold text-[var(--primary)]">
        Taille
        <NativeSelect value={size} onChange={(event) => onSizeChange(event.target.value)}>
          {productSizes.map((item) => (
            <NativeSelectOption key={item} value={item}>
              {item}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      {hasCuts ? (
        <label className="grid gap-1 text-xs font-bold text-[var(--primary)]">
          Coupe
          <NativeSelect
            value={variantId}
            onChange={(event) => onVariantChange(event.target.value)}
          >
            {cutOptions.map((variant) => (
              <NativeSelectOption key={variant.id} value={variant.id}>
                {variant.cut ?? "Standard"}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
      ) : null}
    </div>
  );
}

function ProductAddButton({
  disabled,
  onAdd,
  product,
  fixed = false,
}: {
  disabled?: boolean;
  onAdd: (variantId: string | null, quantity: number) => void;
  product: ProductView;
  fixed?: boolean;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [addedKey, setAddedKey] = useState(0);
  const hasVariants = product.variants.length > 0;
  const directMaxQuantity = stockLimit(product, null);

  function animateAdded() {
    setAddedKey((current) => current + 1);
  }

  function addDirect() {
    onAdd(null, 1);
    animateAdded();
  }

  if (!hasVariants) {
    return (
      <Button
        className={fixed ? "relative w-full shadow-lg" : "relative w-full"}
        disabled={disabled || directMaxQuantity < 1}
        onClick={(event) => {
          event.stopPropagation();
          addDirect();
        }}
        type="button"
      >
        <ShoppingBag className="size-4" />
        Ajouter au panier
        {addedKey > 0 ? <CartAddedPulse key={addedKey} /> : null}
      </Button>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      showSwipeHandle={isMobile}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerTrigger
        render={
          <Button
            className={fixed ? "relative w-full shadow-lg" : "relative w-full"}
            disabled={disabled}
            onClick={(event) => event.stopPropagation()}
            type="button"
          />
        }
      >
        <ShoppingBag className="size-4" />
        Ajouter au panier
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh] sm:max-w-md">
        <ProductOptionDrawerContent
          onAdd={(variantId, quantity) => {
            onAdd(variantId, quantity);
            window.setTimeout(() => setOpen(false), 520);
          }}
          product={product}
        />
      </DrawerContent>
    </Drawer>
  );
}

function ProductOptionDrawerContent({
  onAdd,
  product,
}: {
  onAdd: (variantId: string | null, quantity: number) => void;
  product: ProductView;
}) {
  const cuts = useMemo(
    () =>
      Array.from(
        new Set(
          product.variants
            .map((variant) => variant.cut?.trim())
            .filter((cut): cut is string => Boolean(cut)),
        ),
      ),
    [product.variants],
  );
  const defaultVariant = findDefaultVariant(product);
  const [cut, setCut] = useState(defaultVariant?.cut ?? cuts[0] ?? "");
  const variantsForCut = useMemo(
    () =>
      cuts.length > 0
        ? product.variants.filter((variant) => (variant.cut ?? "") === cut)
        : product.variants,
    [cut, cuts.length, product.variants],
  );
  const availableVariants =
    variantsForCut.length > 0 ? variantsForCut : product.variants;
  const [variantId, setVariantId] = useState(
    defaultVariant?.id ?? availableVariants[0]?.id ?? "",
  );
  const selectedVariant =
    availableVariants.find((variant) => variant.id === variantId) ??
    availableVariants[0] ??
    null;
  const [quantity, setQuantity] = useState(1);
  const [addedKey, setAddedKey] = useState(0);
  const imageSrc = fileUrl(product.imageUrls[0] ?? product.imageUrl ?? "");
  const maxQuantity = stockLimit(product, selectedVariant);
  const safeQuantity = Math.min(maxQuantity || 1, quantity);

  function selectCut(nextCut: string) {
    const nextVariant =
      product.variants.find((variant) => (variant.cut ?? "") === nextCut) ?? null;
    setCut(nextCut);
    setVariantId(nextVariant?.id ?? "");
  }

  return (
    <>
      <DrawerHeader className="gap-3 pb-3">
        <div className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 text-left">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-lg bg-[var(--subtle)]">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-full w-full object-cover" src={imageSrc} />
            ) : (
              <ShoppingBag className="size-6 text-[var(--primary)]" />
            )}
          </div>
          <DrawerTitle className="truncate text-base font-bold text-[var(--primary)]">
            {product.title}
          </DrawerTitle>
          <strong className="whitespace-nowrap text-base font-black text-[var(--primary)]">
            {formatPrice(effectivePrice(product, selectedVariant), product.currency)}
          </strong>
        </div>
      </DrawerHeader>
      <Separator />
      <div className="grid gap-4 px-4 pt-3">
        {cuts.length > 0 ? (
          <div className="grid gap-2">
            <span className="text-sm font-bold text-[var(--primary)]">Coupe</span>
            <div className="flex flex-wrap gap-2">
              {cuts.map((item) => (
                <button
                  className={`rounded-full border px-3 py-1.5 text-sm font-bold transition ${
                    cut === item
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-white text-[var(--primary)] hover:border-[var(--accent)]"
                  }`}
                  key={item}
                  onClick={() => selectCut(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="grid gap-2">
          <span className="text-sm font-bold text-[var(--primary)]">Taille</span>
          <div className="-mx-4 overflow-x-auto px-4 pb-1">
            <div className="flex w-max min-w-full gap-2">
              {availableVariants.map((variant) => (
                <button
                  className={`min-w-16 rounded-lg border px-4 py-3 text-sm font-black transition ${
                    selectedVariant?.id === variant.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-white text-[var(--primary)] hover:border-[var(--accent)]"
                  }`}
                  key={variant.id}
                  onClick={() => setVariantId(variant.id)}
                  type="button"
                >
                  {variant.size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Separator className="mt-4" />
      <DrawerFooter className="bg-popover pt-4">
        <div className="grid gap-2">
          <span className="text-sm font-bold text-[var(--primary)]">Quantité</span>
          <QuantityControl
            fullWidth
            max={maxQuantity}
            min={1}
            onChange={setQuantity}
            quantity={safeQuantity}
          />
        </div>
        <Button
          className="relative"
          disabled={!selectedVariant || maxQuantity < 1}
          onClick={() => {
            setAddedKey((current) => current + 1);
            onAdd(selectedVariant?.id ?? null, safeQuantity);
          }}
          type="button"
        >
          <ShoppingBag className="size-4" />
          Ajouter au panier
          {addedKey > 0 ? <CartAddedPulse key={addedKey} /> : null}
        </Button>
      </DrawerFooter>
    </>
  );
}

function CartAddedPulse() {
  return (
    <span className="pointer-events-none absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-[var(--accent)] text-white shadow-lg animate-[cart-fly_700ms_ease-out_forwards]">
      <ShoppingBag className="size-4" />
    </span>
  );
}

function CartSheet({
  cartLines,
  currency,
  initialUser,
  onRemoveLine,
  onUpdateLine,
  onUpdateLineVariant,
  products,
  pulseKey,
  storefront,
  totalCents,
}: {
  cartLines: CartLine[];
  currency: string;
  initialUser?: StoreInitialUser | null;
  onRemoveLine: (key: string) => void;
  onUpdateLine: (key: string, quantity: number) => void;
  onUpdateLineVariant: (key: string, variantId: string | null) => void;
  products: ProductView[];
  pulseKey: number;
  storefront: StorefrontView;
  totalCents: number;
}) {
  const itemCount = cartLines.reduce((total, item) => total + item.quantity, 0);
  const previousItemCount = useRef(itemCount);
  const [countPulseKey, setCountPulseKey] = useState(0);
  const cartItems = cartLines
    .map((line) => {
      const product = products.find((item) => item.id === line.productId);
      const variant = line.variantId
        ? product?.variants.find((item) => item.id === line.variantId) ?? null
        : null;

      return product ? { line, product, variant } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  useEffect(() => {
    if (itemCount !== previousItemCount.current) {
      setCountPulseKey((current) => current + 1);
      previousItemCount.current = itemCount;
    }
  }, [itemCount]);

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            className={`relative shadow-lg ${
              pulseKey > 0 ? "animate-[cart-button-bump_360ms_ease-out]" : ""
            }`}
            key={pulseKey}
          />
        }
      >
        <ShoppingBag className="size-4" />
        Panier
        <span
          className={`ml-1 inline-grid min-w-6 place-items-center rounded-full bg-white/20 px-1.5 text-xs font-black tabular-nums ${
            countPulseKey > 0 ? "animate-[cart-count-pop_360ms_ease-out]" : ""
          }`}
          key={countPulseKey}
        >
          {itemCount}
        </span>
      </SheetTrigger>
      <SheetContent className="w-full max-w-full overflow-x-hidden overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Panier de réservation</SheetTitle>
          <SheetDescription>
            Aucun paiement en ligne. L’équipe confirme ensuite.
          </SheetDescription>
        </SheetHeader>
        <form action={createStoreReservation} className="grid min-w-0 gap-4 px-4 pt-0 ">
          {cartItems.map(({ line }) => (
            <div key={`hidden-${line.key}`}>
              <input name="cartProductId" type="hidden" value={line.productId} />
              <input name="cartVariantId" type="hidden" value={line.variantId ?? ""} />
              <input name="cartQuantity" type="hidden" value={line.quantity} />
            </div>
          ))}

          <div className="grid gap-2 pt-0">
            {cartItems.length > 0 ? (
              cartItems.map(({ line, product, variant }) => {
                const unitCents = effectivePrice(product, variant);
                const max = stockLimit(product, variant);
                const imageSrc = fileUrl(product.imageUrls[0] ?? product.imageUrl ?? "");

                return (
                <div
                  className="relative grid min-w-0 gap-3 rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm"
                  key={line.key}
                >
                  <Button
                    aria-label="Retirer du panier"
                    className="absolute right-2 top-2 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                    onClick={() => onRemoveLine(line.key)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <div className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] gap-3 sm:grid-cols-[64px_minmax(0,1fr)_auto]">
                    <div className="flex size-14 overflow-hidden rounded-lg bg-[var(--subtle)] sm:size-16">
                      {imageSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt=""
                          className="h-full w-full object-cover"
                          src={imageSrc}
                        />
                      ) : (
                        <span className="grid h-full w-full place-items-center">
                          <ShoppingBag className="size-5 text-[var(--primary)]" />
                        </span>
                      )}
                    </div>
                    <span className="min-w-0 self-center pr-12">
                      <strong className="block truncate text-sm text-[var(--primary)] sm:text-base">
                        {product.title}
                      </strong>
                      {variant ? (
                        <small className="block truncate text-[var(--muted)] font-bold ">
                          {variantLabel(variant)}
                        </small>
                      ) : null}
                      <small className="block text-[var(--muted)]">
                        {formatPrice(unitCents, product.currency)} l’unité
                      </small>
                    </span>
                  </div>
                  {product.variants.length > 0 ? (
                    <CartLineVariantSelect
                      line={line}
                      onChange={(variantId) => onUpdateLineVariant(line.key, variantId)}
                      product={product}
                      variant={variant}
                    />
                  ) : null}
                  <div className="flex justify-between min-w-0 items-center gap-2">
                    <QuantityControl
                      max={max}
                      min={1}
                      onChange={(quantity) => onUpdateLine(line.key, quantity)}
                      quantity={line.quantity}
                    />
                    <strong className="col-span-2 whitespace-nowrap text-right text-lg text-[var(--primary)] sm:col-span-1 sm:self-center sm:text-base">
                      {formatPrice(unitCents * line.quantity, product.currency)}
                    </strong>
                  </div>
                </div>
                );
              })
            ) : (
              <p className="rounded-lg bg-[var(--subtle)] p-3 text-sm text-[var(--muted)]">
                Choisissez une variation puis cliquez sur Ajouter.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
            <span className="font-bold text-[var(--primary)]">Total indicatif</span>
            <strong className="text-xl text-[var(--primary)]">
              {formatPrice(totalCents, currency)}
            </strong>
          </div>

          <StoreReservationCustomerFields
            disabled={!storefront.active}
            initialUser={initialUser}
          />
          <Textarea
            name="note"
            placeholder="Note pour l’équipe : livraison, adresse, besoin particulier..."
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
            {storefront.active ? "Envoyer la réservation" : "Réservations fermées"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function CartLineVariantSelect({
  line,
  onChange,
  product,
  variant,
}: {
  line: CartLine;
  onChange: (variantId: string | null) => void;
  product: ProductView;
  variant: ProductVariantView | null;
}) {
  const productSizes = sizesFor(product);
  const selectedVariant = variant ?? findDefaultVariant(product);
  const selectedSize = selectedVariant?.size ?? productSizes[0] ?? "";
  const cutOptions = selectedSize ? cutsFor(product, selectedSize) : [];
  const hasCuts = cutOptions.some((item) => Boolean(item.cut));

  function selectSize(size: string) {
    const nextVariant = cutsFor(product, size)[0] ?? null;
    onChange(nextVariant?.id ?? null);
  }

  return (
    <div
      className={`grid gap-2 rounded-lg bg-[var(--subtle)] p-2 ${
        hasCuts ? "grid-cols-2" : ""
      }`}
    >
      <label className="grid min-w-0 gap-1 text-xs font-bold text-[var(--primary)]">
        <span>
          Taille : <strong>{selectedSize}</strong>
        </span>
        <NativeSelect
          className="font-bold"
          name={`cartSize-${line.key}`}
          onChange={(event) => selectSize(event.target.value)}
          value={selectedSize}
        >
          {productSizes.map((size) => (
            <NativeSelectOption key={size} value={size}>
              {size}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      {hasCuts ? (
        <label className="grid min-w-0 gap-1 text-xs font-bold text-[var(--primary)]">
          <span>
            Coupe : <strong>{selectedVariant?.cut ?? "Standard"}</strong>
          </span>
          <NativeSelect
            name={`cartCut-${line.key}`}
            onChange={(event) => onChange(event.target.value)}
            value={selectedVariant?.id ?? cutOptions[0]?.id ?? ""}
          >
            {cutOptions.map((item) => (
              <NativeSelectOption key={item.id} value={item.id}>
                {item.cut ?? "Standard"}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
      ) : null}
    </div>
  );
}

export function StoreProductDetailReservationClient({
  disabled,
  product,
  storefront,
  initialUser,
}: {
  disabled?: boolean;
  product: ProductView;
  storefront: StorefrontView;
  initialUser?: StoreInitialUser | null;
}) {
  const [cartLines, setCartLines] = useState<CartLine[]>(readStoredCartLines);
  const [cartPulseKey, setCartPulseKey] = useState(0);
  const detailPriceSummary = priceSummary(product);
  const totalCents = cartLines.reduce((total, line) => {
    const variant = line.variantId
      ? product.variants.find((item) => item.id === line.variantId) ?? null
      : null;
    return total + effectivePrice(product, variant) * line.quantity;
  }, 0);

  useEffect(() => {
    storeCartLines(cartLines);
  }, [cartLines]);

  function addToCart(variantId: string | null, quantity: number) {
    const key = cartLineKey(product.id, variantId);
    const variant = variantId
      ? product.variants.find((item) => item.id === variantId) ?? null
      : null;
    const max = stockLimit(product, variant);
    if (max < 1) return;

    setCartLines((current) => {
      const existing = current.find((line) => line.key === key);
      if (existing) {
        return current.map((line) =>
          line.key === key
            ? { ...line, quantity: Math.min(max, line.quantity + quantity) }
            : line,
        );
      }

      return [
        ...current,
        {
          key,
          productId: product.id,
          variantId,
          quantity: Math.min(max, quantity),
        },
      ];
    });
    setCartPulseKey((current) => current + 1);
  }

  function updateCartLine(key: string, quantity: number) {
    setCartLines((current) =>
      current.map((line) => {
        if (line.key !== key) return line;
        const variant = line.variantId
          ? product.variants.find((item) => item.id === line.variantId) ?? null
          : null;
        const max = stockLimit(product, variant);

        return { ...line, quantity: Math.min(max, Math.max(1, quantity)) };
      }),
    );
    setCartPulseKey((current) => current + 1);
  }

  function updateCartLineVariant(key: string, variantId: string | null) {
    setCartLines((current) => {
      const line = current.find((item) => item.key === key);
      if (!line) return current;

      const variant = variantId
        ? product.variants.find((item) => item.id === variantId) ?? null
        : null;
      const nextKey = cartLineKey(product.id, variant?.id ?? null);
      const max = stockLimit(product, variant);
      const nextQuantity = Math.min(max, line.quantity);
      const duplicate = current.find((item) => item.key === nextKey);

      if (duplicate && duplicate.key !== key) {
        return current
          .filter((item) => item.key !== key)
          .map((item) =>
            item.key === duplicate.key
              ? { ...item, quantity: Math.min(max, item.quantity + nextQuantity) }
              : item,
          );
      }

      return current.map((item) =>
        item.key === key
          ? {
              ...item,
              key: nextKey,
              variantId: variant?.id ?? null,
              quantity: nextQuantity,
            }
          : item,
      );
    });
    setCartPulseKey((current) => current + 1);
  }

  function removeCartLine(key: string) {
    setCartLines((current) => current.filter((line) => line.key !== key));
  }

  return (
    <>
      <div className="fixed inset-x-0 top-[70px] z-20 border-b border-[var(--border)] bg-white/92 shadow-sm backdrop-blur md:top-[74px]">
        <div className="container flex min-h-16 items-center justify-between gap-4">
          <div className="min-w-0">
            <strong className="block truncate text-base text-[var(--primary)]">
              {storefront.name}
            </strong>
            <small className="block truncate text-[var(--muted)]">
              Réservation sans paiement
            </small>
          </div>
          <CartSheet
            cartLines={cartLines}
            currency={product.currency}
            initialUser={initialUser}
            onRemoveLine={removeCartLine}
            onUpdateLine={updateCartLine}
            onUpdateLineVariant={updateCartLineVariant}
            products={[product]}
            pulseKey={cartPulseKey}
            storefront={storefront}
            totalCents={totalCents}
          />
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-white/95 p-3 shadow-[0_-14px_40px_rgba(6,40,70,0.14)] backdrop-blur">
        <div className="container flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-sm text-[var(--primary)]">
              {product.title}
            </strong>
            <span className="text-sm font-black text-[var(--primary)]">
              {detailPriceSummary.varies ? (
                <>
                  <span className="mr-1 text-xs font-bold text-[var(--muted)]">
                    À partir de
                  </span>
                  {formatPrice(detailPriceSummary.min, product.currency)}
                </>
              ) : (
                formatPrice(product.priceCents, product.currency)
              )}
            </span>
          </div>
          <div className="w-44 max-w-[52vw]">
            <ProductAddButton
              disabled={disabled}
              fixed
              onAdd={addToCart}
              product={product}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export function StoreReservationCustomerFields({
  disabled,
  initialUser,
}: {
  disabled?: boolean;
  initialUser?: StoreInitialUser | null;
}) {
  const isConnected = Boolean(initialUser?.email);
  const fullName = [initialUser?.firstName, initialUser?.lastName]
    .filter(Boolean)
    .join(" ");

  if (!isConnected) {
    return (
      <>
        <Input disabled={disabled} name="customerName" placeholder="Nom et prénom" required />
        <Input disabled={disabled} name="customerEmail" placeholder="Email" required type="email" />
        <PhoneInputGroup
          disabled={disabled}
          id="store-phone"
          name="customerPhone"
          placeholder="6 12 34 56 78"
        />
        <Input disabled={disabled} name="yeshiva" placeholder="Yeshiva" />
      </>
    );
  }

  return (
    <>
      <input name="customerEmail" type="hidden" value={initialUser?.email ?? ""} />
      <input name="customerName" type="hidden" value={fullName} />
      {initialUser?.phone ? (
        <input name="customerPhone" type="hidden" value={initialUser.phone} />
      ) : (
        <PhoneInputGroup
          disabled={disabled}
          id="store-connected-phone"
          name="customerPhone"
          placeholder="6 12 34 56 78"
        />
      )}
      {initialUser?.yeshiva ? (
        <input name="yeshiva" type="hidden" value={initialUser.yeshiva} />
      ) : (
        <Input disabled={disabled} name="yeshiva" placeholder="Yeshiva" />
      )}
    </>
  );
}

export function StoreProductReservationPanel({
  disabled,
  initialUser,
  mode = "reservation",
  onAddToCart,
  product,
}: {
  disabled?: boolean;
  initialUser?: StoreInitialUser | null;
  mode?: "reservation" | "cart";
  onAddToCart?: (variantId: string | null, quantity: number) => void;
  product: ProductView;
}) {
  const defaultVariant = findDefaultVariant(product);
  const [size, setSize] = useState(defaultVariant?.size ?? "");
  const [variantId, setVariantId] = useState(defaultVariant?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const productSizes = useMemo(() => sizesFor(product), [product]);
  const cutOptions = size ? cutsFor(product, size) : [];
  const selectedVariant = findVariant(product, size, variantId);
  const hasVariants = product.variants.length > 0;
  const maxQuantity = stockLimit(product, hasVariants ? selectedVariant : null);
  const safeQuantity = Math.min(maxQuantity || 1, quantity);

  function selectSize(nextSize: string) {
    const nextVariant = cutsFor(product, nextSize)[0] ?? null;
    setSize(nextSize);
    setVariantId(nextVariant?.id ?? "");
  }

  const controls = (
    <>
      <input name="cartProductId" type="hidden" value={product.id} />
      <input name="cartVariantId" type="hidden" value={selectedVariant?.id ?? ""} />
      <input name="cartQuantity" type="hidden" value={safeQuantity} />
      {hasVariants ? (
        <VariantSelector
          cutOptions={cutOptions}
          onSizeChange={selectSize}
          onVariantChange={setVariantId}
          productSizes={productSizes}
          size={size}
          variantId={selectedVariant?.id ?? ""}
        />
      ) : null}
      <div className="grid gap-2">
        <span className="text-sm font-bold text-[var(--primary)]">Quantité</span>
        <QuantityControl
          disabled={disabled}
          max={maxQuantity}
          min={1}
          onChange={setQuantity}
          quantity={safeQuantity}
        />
      </div>
    </>
  );

  if (mode === "cart") {
    return (
      <div className="grid gap-4">
        {controls}
        <Button
          disabled={disabled || maxQuantity < 1 || (hasVariants && !selectedVariant)}
          onClick={() => onAddToCart?.(selectedVariant?.id ?? null, safeQuantity)}
          type="button"
        >
          <ShoppingBag className="size-4" />
          Ajouter au panier
        </Button>
      </div>
    );
  }

  return (
    <form action={createStoreReservation} className="grid gap-4">
      {controls}
      <StoreReservationCustomerFields disabled={disabled} initialUser={initialUser} />
      <Textarea
        name="note"
        placeholder="Note pour l’équipe : livraison, adresse, besoin particulier..."
        disabled={disabled}
      />
      <Button disabled={disabled || maxQuantity < 1 || (hasVariants && !selectedVariant)}>
        <ShoppingBag className="size-4" />
        {disabled ? "Réservations fermées" : "Envoyer la réservation"}
      </Button>
    </form>
  );
}

function QuantityControl({
  disabled,
  fullWidth = false,
  max,
  min = 0,
  onChange,
  quantity,
}: {
  disabled?: boolean;
  fullWidth?: boolean;
  max?: number;
  min?: number;
  onChange: (quantity: number) => void;
  quantity: number;
}) {
  const [animationKey, setAnimationKey] = useState(0);
  const canDecrease = quantity > min;
  const canIncrease = max == null || quantity < max;

  function updateQuantity(nextQuantity: number) {
    const next = Math.min(max ?? Number.MAX_SAFE_INTEGER, Math.max(min, nextQuantity));

    if (next > quantity) {
      setAnimationKey((current) => current + 1);
    }

    onChange(next);
  }

  return (
    <div
      className={`relative grid items-center rounded-lg border border-[var(--border)] bg-white p-1 shadow-sm ${
        fullWidth
          ? "w-full grid-cols-[2.75rem_minmax(0,1fr)_2.75rem]"
          : "w-fit grid-cols-[2.35rem_3.25rem_2.35rem] sm:grid-cols-[2rem_3rem_2rem]"
      }`}
    >
      {animationKey > 0 ? (
        <span
          className="pointer-events-none absolute right-2 top-1/2 z-10 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-[var(--accent)] text-white shadow-lg animate-[cart-fly_700ms_ease-out_forwards]"
          key={animationKey}
        >
          <ShoppingBag className="size-3.5" />
        </span>
      ) : null}
      <Button
        aria-label="Retirer"
        onClick={() => updateQuantity(quantity - 1)}
        disabled={disabled || !canDecrease}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <Minus className="size-4" />
      </Button>
      <Input
        className="h-9 w-full border-0 p-0 text-center text-sm font-bold tabular-nums"
        max={max}
        min={min}
        onChange={(event) => updateQuantity(Number(event.target.value) || min)}
        disabled={disabled}
        type="number"
        value={quantity}
      />
      <Button
        aria-label="Ajouter"
        onClick={() => updateQuantity(quantity + 1)}
        disabled={disabled || !canIncrease}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
