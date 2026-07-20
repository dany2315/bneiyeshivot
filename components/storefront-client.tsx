"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Textarea } from "@/components/ui/textarea";

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
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const totalCents = cartLines.reduce((total, line) => {
    const product = products.find((item) => item.id === line.productId);
    return total + (product?.priceCents ?? 0) * line.quantity;
  }, 0);
  const currency =
    products.find((product) => product.id === cartLines[0]?.productId)?.currency ??
    "ILS";

  function addToCart(product: ProductView, variantId: string | null, quantity = 1) {
    const key = `${product.id}:${variantId ?? "base"}`;
    const variant = variantId
      ? product.variants.find((item) => item.id === variantId) ?? null
      : null;
    const max = Math.min(50, variant?.stockQuantity ?? product.stockQuantity ?? 50);

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
  }

  function updateCartLine(key: string, quantity: number) {
    setCartLines((current) =>
      current
        .map((line) =>
          line.key === key ? { ...line, quantity: Math.max(1, quantity) } : line,
        )
        .filter((line) => line.quantity > 0),
    );
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
            currency={currency}
            initialUser={initialUser}
            onRemoveLine={removeCartLine}
            onUpdateLine={updateCartLine}
            products={products}
            storefront={storefront}
            totalCents={totalCents}
          />
        </div>
      </div>

      <div className="container grid gap-4 pt-24">
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
  const router = useRouter();
  const productSizes = sizesFor(product);
  const defaultVariant = findDefaultVariant(product);
  const [size, setSize] = useState(defaultVariant?.size ?? "");
  const [variantId, setVariantId] = useState(defaultVariant?.id ?? "");
  const selectedVariant = findVariant(product, size, variantId);
  const cutOptions = size ? cutsFor(product, size) : [];
  const hasVariants = product.variants.length > 0;

  function selectSize(nextSize: string) {
    const nextVariant = cutsFor(product, nextSize)[0] ?? null;
    setSize(nextSize);
    setVariantId(nextVariant?.id ?? "");
  }

  return (
    <Card
      className="cursor-pointer overflow-hidden py-0 transition hover:-translate-y-0.5 hover:shadow-lg"
      onClick={() => router.push(`/boutique/${product.slug}`)}
    >
      <div onClick={(event) => event.stopPropagation()}>
        <StoreProductImageDialog
          imageUrl={product.imageUrl}
          imageUrls={product.imageUrls}
          title={product.title}
        />
      </div>
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
            onClick={(event) => event.stopPropagation()}
          >
            {product.title}
          </Link>
        </CardTitle>
        {productSizes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {productSizes.slice(0, 5).map((item) => (
              <button
                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs font-bold text-[var(--primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                key={item}
                onClick={(event) => {
                  event.stopPropagation();
                  router.push(`/boutique/${product.slug}`);
                }}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3 px-3 pb-3 pt-0 md:px-4">
        <strong className="text-base text-[var(--primary)] md:text-xl">
          {formatPrice(product.priceCents, product.currency)}
        </strong>
        {false ? (
          <VariantSelector
            cutOptions={cutOptions}
            onSizeChange={selectSize}
            onVariantChange={setVariantId}
            productSizes={productSizes}
            size={size}
            variantId={selectedVariant?.id ?? ""}
          />
        ) : null}
        <div className="hidden">
          <Button asChild size="sm" variant="secondary">
            <Link href={`/boutique/${product.slug}`}>Voir le détail</Link>
          </Button>
          <Button
            disabled={disabled || (hasVariants && !selectedVariant)}
            onClick={() => onAddToCart(product, selectedVariant?.id ?? null)}
            size="sm"
            type="button"
          >
            <ShoppingBag className="size-4" />
            Ajouter
          </Button>
        </div>
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
        disabled={disabled}
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
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
      </SheetTrigger>
      <SheetContent
        className="max-h-[85vh] overflow-y-auto sm:max-w-md"
        side={isMobile ? "bottom" : "right"}
      >
        <ProductAddDrawerContent
          onAdd={(variantId, quantity) => {
            onAdd(variantId, quantity);
            window.setTimeout(() => setOpen(false), 520);
          }}
          product={product}
        />
      </SheetContent>
    </Sheet>
  );
}

function ProductAddDrawerContent({
  onAdd,
  product,
}: {
  onAdd: (variantId: string | null, quantity: number) => void;
  product: ProductView;
}) {
  const defaultVariant = findDefaultVariant(product);
  const [size, setSize] = useState(defaultVariant?.size ?? "");
  const [variantId, setVariantId] = useState(defaultVariant?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const productSizes = useMemo(() => sizesFor(product), [product]);
  const cutOptions = size ? cutsFor(product, size) : [];
  const selectedVariant = findVariant(product, size, variantId);
  const [addedKey, setAddedKey] = useState(0);

  function selectSize(nextSize: string) {
    const nextVariant = cutsFor(product, nextSize)[0] ?? null;
    setSize(nextSize);
    setVariantId(nextVariant?.id ?? "");
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{product.title}</SheetTitle>
        <SheetDescription>
          Sélectionnez la taille et la coupe avant l’ajout au panier.
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 px-4">
        <VariantSelector
          cutOptions={cutOptions}
          onSizeChange={selectSize}
          onVariantChange={setVariantId}
          productSizes={productSizes}
          size={size}
          variantId={selectedVariant?.id ?? ""}
        />
        <div className="grid gap-2">
          <span className="text-sm font-bold text-[var(--primary)]">Quantité</span>
          <QuantityControl min={1} onChange={setQuantity} quantity={quantity} />
        </div>
      </div>
      <SheetFooter className="sticky bottom-0 bg-popover pt-4">
        <Button
          className="relative"
          disabled={!selectedVariant}
          onClick={() => {
            setAddedKey((current) => current + 1);
            onAdd(selectedVariant?.id ?? null, quantity);
          }}
          type="button"
        >
          <ShoppingBag className="size-4" />
          Ajouter au panier
          {addedKey > 0 ? <CartAddedPulse key={addedKey} /> : null}
        </Button>
      </SheetFooter>
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
  products,
  storefront,
  totalCents,
}: {
  cartLines: CartLine[];
  currency: string;
  initialUser?: StoreInitialUser | null;
  onRemoveLine: (key: string) => void;
  onUpdateLine: (key: string, quantity: number) => void;
  products: ProductView[];
  storefront: StorefrontView;
  totalCents: number;
}) {
  const itemCount = cartLines.reduce((total, item) => total + item.quantity, 0);
  const cartItems = cartLines
    .map((line) => {
      const product = products.find((item) => item.id === line.productId);
      const variant = line.variantId
        ? product?.variants.find((item) => item.id === line.variantId) ?? null
        : null;

      return product ? { line, product, variant } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <Sheet>
      <SheetTrigger render={<Button className="shadow-lg" />}>
        <ShoppingBag className="size-4" />
        Panier
        {itemCount > 0 ? ` (${itemCount})` : ""}
      </SheetTrigger>
      <SheetContent className="w-full max-w-full overflow-x-hidden overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Panier de réservation</SheetTitle>
          <SheetDescription>
            Aucun paiement en ligne. L’équipe confirme ensuite.
          </SheetDescription>
        </SheetHeader>
        <form action={createStoreReservation} className="grid min-w-0 gap-4 px-4 pb-4">
          {cartItems.map(({ line }) => (
            <div key={`hidden-${line.key}`}>
              <input name="cartProductId" type="hidden" value={line.productId} />
              <input name="cartVariantId" type="hidden" value={line.variantId ?? ""} />
              <input name="cartQuantity" type="hidden" value={line.quantity} />
            </div>
          ))}

          <div className="grid gap-2">
            {cartItems.length > 0 ? (
              cartItems.map(({ line, product, variant }) => (
                <div
                  className="grid min-w-0 gap-3 rounded-lg border border-[var(--border)] p-3"
                  key={line.key}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                    <span className="min-w-0">
                      <strong className="block truncate">{product.title}</strong>
                      {variant ? (
                        <small className="block text-[var(--muted)]">
                          {variantLabel(variant)}
                        </small>
                      ) : null}
                      <small className="text-[var(--muted)]">
                        {formatPrice(product.priceCents, product.currency)}
                      </small>
                    </span>
                    <strong className="whitespace-nowrap text-[var(--primary)]">
                      {formatPrice(product.priceCents * line.quantity, product.currency)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <QuantityControl
                      min={1}
                      onChange={(quantity) => onUpdateLine(line.key, quantity)}
                      quantity={line.quantity}
                    />
                    <Button
                      aria-label="Retirer du panier"
                      onClick={() => onRemoveLine(line.key)}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
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
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const totalCents = cartLines.reduce(
    (total, line) => total + product.priceCents * line.quantity,
    0,
  );

  function addToCart(variantId: string | null, quantity: number) {
    const key = `${product.id}:${variantId ?? "base"}`;
    const variant = variantId
      ? product.variants.find((item) => item.id === variantId) ?? null
      : null;
    const max = Math.min(50, variant?.stockQuantity ?? product.stockQuantity ?? 50);

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
  }

  function updateCartLine(key: string, quantity: number) {
    setCartLines((current) =>
      current.map((line) =>
        line.key === key ? { ...line, quantity: Math.max(1, quantity) } : line,
      ),
    );
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
            products={[product]}
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
              {formatPrice(product.priceCents, product.currency)}
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

  function selectSize(nextSize: string) {
    const nextVariant = cutsFor(product, nextSize)[0] ?? null;
    setSize(nextSize);
    setVariantId(nextVariant?.id ?? "");
  }

  const controls = (
    <>
      <input name="cartProductId" type="hidden" value={product.id} />
      <input name="cartVariantId" type="hidden" value={selectedVariant?.id ?? ""} />
      <input name="cartQuantity" type="hidden" value={quantity} />
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
          min={1}
          onChange={setQuantity}
          quantity={quantity}
        />
      </div>
    </>
  );

  if (mode === "cart") {
    return (
      <div className="grid gap-4">
        {controls}
        <Button
          disabled={disabled || (hasVariants && !selectedVariant)}
          onClick={() => onAddToCart?.(selectedVariant?.id ?? null, quantity)}
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
      <Button disabled={disabled || (hasVariants && !selectedVariant)}>
        <ShoppingBag className="size-4" />
        {disabled ? "Réservations fermées" : "Envoyer la réservation"}
      </Button>
    </form>
  );
}

function QuantityControl({
  disabled,
  min = 0,
  onChange,
  quantity,
}: {
  disabled?: boolean;
  min?: number;
  onChange: (quantity: number) => void;
  quantity: number;
}) {
  const [animationKey, setAnimationKey] = useState(0);
  const canDecrease = quantity > min;

  function updateQuantity(nextQuantity: number) {
    const next = Math.max(min, nextQuantity);

    if (next > quantity) {
      setAnimationKey((current) => current + 1);
    }

    onChange(next);
  }

  return (
    <div className="relative grid w-fit grid-cols-[2.35rem_3.25rem_2.35rem] items-center rounded-lg border border-[var(--border)] bg-white p-1 shadow-sm sm:grid-cols-[2rem_3rem_2rem]">
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
        min={min}
        onChange={(event) => updateQuantity(Number(event.target.value) || min)}
        disabled={disabled}
        type="number"
        value={quantity}
      />
      <Button
        aria-label="Ajouter"
        onClick={() => updateQuantity(quantity + 1)}
        disabled={disabled}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
