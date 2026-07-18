import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { PageShell } from "@/app/components";
import { createStoreReservation } from "@/app/boutique/actions";
import { StoreProductImageDialog } from "@/components/store-product-image-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
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
  const storefront = await ensureDefaultStorefront();
  const product = await prisma.storeProduct.findUnique({
    where: { slug },
  });

  if (!product || !product.active || product.storefrontId !== storefront.id) {
    notFound();
  }

  return (
    <PageShell>
      <main>
        <section className="section">
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
                      Recommande
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
                  {product.details ? (
                    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
                      <h2 className="text-lg font-bold text-[var(--primary)]">
                        Details du produit
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
                  <CardTitle>Reserver ce produit</CardTitle>
                  <CardDescription>
                    Aucun paiement en ligne. L&apos;equipe confirme ensuite.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={createStoreReservation} className="grid gap-4">
                    <Input
                      min="1"
                      name={`quantity-${product.id}`}
                      type="number"
                      defaultValue="1"
                    />
                    <Input name="customerName" placeholder="Nom et prenom" required />
                    <Input name="customerEmail" placeholder="Email" required type="email" />
                    <Input name="customerPhone" placeholder="Telephone" />
                    <Input name="yeshiva" placeholder="Yeshiva" />
                    <Input name="arrivalDate" type="date" aria-label="Date d'arrivee" />
                    <Textarea
                      name="note"
                      placeholder="Note pour l'equipe : livraison, adresse, besoin particulier..."
                    />
                    <Button disabled={!storefront.active}>
                      <ShoppingBag className="size-4" />
                      Envoyer la reservation
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
