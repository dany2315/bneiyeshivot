import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { PageShell } from "@/app/components";
import { StoreProductDetailReservationClient } from "@/components/storefront-client";
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
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ensureDefaultStorefront, formatStorePrice } from "@/lib/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.storeProduct.findUnique({
    where: { slug },
    select: { title: true, description: true },
  });

  return {
    title: product?.title ?? "Produit boutique",
    description: product?.description,
  };
}

export default async function StoreProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [storefront, user] = await Promise.all([
    ensureDefaultStorefront(),
    getCurrentUser(),
  ]);
  const product = await prisma.storeProduct.findUnique({
    where: { slug },
    include: {
      variants: {
        where: { active: true },
        orderBy: [{ size: "asc" }, { cut: "asc" }],
      },
    },
  });

  if (!product || !product.active || product.storefrontId !== storefront.id) {
    notFound();
  }

  return (
    <PageShell>
      <main>
        <section className="section pt-24">
          <div className="container grid gap-8 lg:grid-cols-[1fr_390px]">
            <div className="grid gap-5">
              <Button asChild className="w-fit" variant="secondary">
                <Link href="/boutique">
                  <ArrowLeft className="size-4" />
                  Retour boutique
                </Link>
              </Button>

              <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                <Card className="overflow-hidden">
                  <StoreProductImageDialog
                    imageUrl={product.imageUrl}
                    imageUrls={product.imageUrls}
                    title={product.title}
                  />
                </Card>

                <div className="grid content-start gap-4">
                  {product.featured ? (
                    <Badge className="w-fit" variant="success">
                      Recommandé
                    </Badge>
                  ) : null}
                  <div>
                    <h1 className="font-serif text-5xl font-bold leading-none text-[var(--primary-strong)]">
                      {product.title}
                    </h1>
                    <p className="mt-4 text-3xl font-black text-[var(--primary)]">
                      {formatStorePrice(product.priceCents, product.currency)}
                    </p>
                  </div>
                  <p className="text-lg leading-8 text-[var(--muted)]">
                    {product.description}
                  </p>
                  {product.variants.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(product.variants.map((variant) => variant.size))).map(
                        (size) => (
                          <Badge key={size} variant="outline">
                            {size}
                          </Badge>
                        ),
                      )}
                    </div>
                  ) : null}
                  {product.details ? (
                    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
                      <h2 className="text-lg font-bold text-[var(--primary)]">
                        Détails du produit
                      </h2>
                      <p className="mt-2 whitespace-pre-line text-base leading-7 text-[var(--muted)]">
                        {product.details}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle>Réserver ce produit</CardTitle>
                  <CardDescription>
                    Choisissez la variation, ajoutez-la au panier, puis finalisez la réservation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!storefront.active ? (
                    <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-950">
                      <ShoppingBag className="size-4" />
                      <AlertTitle>Boutique fermée</AlertTitle>
                      <AlertDescription>
                        Les réservations sont momentanément fermées. Il n’est
                        pas possible de réserver ce produit pour le moment.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  <StoreProductDetailReservationClient
                    disabled={!storefront.active}
                    initialUser={
                      user
                        ? {
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            phone: user.phone,
                            yeshiva: user.yeshiva,
                          }
                        : null
                    }
                    storefront={{
                      active: storefront.active,
                      description: storefront.description,
                      name: storefront.name,
                      pickupDetails: storefront.pickupDetails,
                    }}
                    product={{
                      id: product.id,
                      title: product.title,
                      slug: product.slug,
                      description: product.description,
                      priceCents: product.priceCents,
                      currency: product.currency,
                      imageUrl: product.imageUrl,
                      imageUrls: product.imageUrls,
                      stockQuantity: product.stockQuantity,
                      featured: product.featured,
                      variants: product.variants.map((variant) => ({
                        id: variant.id,
                        size: variant.size,
                        cut: variant.cut,
                        stockQuantity: variant.stockQuantity,
                      })),
                    }}
                  />
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
