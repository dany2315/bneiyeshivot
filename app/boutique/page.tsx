import { CheckCircle2, ShoppingBag } from "lucide-react";
import { PageShell } from "../components";
import { createStoreReservation } from "./actions";
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
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { ensureDefaultStorefront, formatStorePrice } from "@/lib/store";

export const metadata = {
  title: "Boutique",
};

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ reservation?: string }>;
}) {
  const params = await searchParams;
  const storefront = await ensureDefaultStorefront();
  const products = await prisma.storeProduct.findMany({
    where: { storefrontId: storefront.id, active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
  });

  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Reservation sans paiement</span>
            <h1>{storefront.heroTitle}</h1>
            <p>{storefront.heroSubtitle}</p>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-6 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
            <div className="grid gap-4">
              {params.reservation === "ok" && (
                <Alert className="border-green-200 bg-green-50 text-green-950">
                  <CheckCircle2 className="size-4" />
                  <AlertTitle>Reservation envoyee</AlertTitle>
                  <AlertDescription>
                    Nous avons bien recu votre reservation. L&apos;equipe vous
                    recontactera pour confirmer la disponibilite.
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <span className="eyebrow">{storefront.name}</span>
                <h2 className="mt-2 text-3xl font-semibold">
                  Choisissez vos produits
                </h2>
                <p className="mt-2 max-w-2xl text-base text-[var(--muted)]">
                  {storefront.description}
                </p>
              </div>

              {products.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {products.map((product) => (
                    <Card className="overflow-hidden" key={product.id}>
                      <StoreProductImageDialog
                        imageUrl={product.imageUrl}
                        imageUrls={product.imageUrls}
                        title={product.title}
                      />
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            {product.featured && (
                              <Badge variant="success">Recommande</Badge>
                            )}
                            <CardTitle className="mt-2">
                              {product.title}
                            </CardTitle>
                          </div>
                          <strong className="text-xl text-[var(--primary)]">
                            {formatStorePrice(
                              product.priceCents,
                              product.currency,
                            )}
                          </strong>
                        </div>
                        <CardDescription>{product.description}</CardDescription>
                      </CardHeader>
                      {product.details && (
                        <CardContent>
                          <p className="text-sm text-[var(--muted)]">
                            {product.details}
                          </p>
                        </CardContent>
                      )}
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

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle>Faire une reservation</CardTitle>
                  <CardDescription>
                    Aucun paiement en ligne. L&apos;admin recoit votre demande
                    et confirme ensuite.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={createStoreReservation} className="grid gap-4">
                    <div className="grid gap-3">
                      {products.map((product) => (
                        <label
                          className="grid grid-cols-[1fr_88px] items-center gap-3 rounded-lg border border-[var(--border)] p-3"
                          key={product.id}
                        >
                          <span>
                            <strong className="block">{product.title}</strong>
                            <small className="text-[var(--muted)]">
                              {formatStorePrice(
                                product.priceCents,
                                product.currency,
                              )}
                              {product.stockQuantity != null
                                ? ` - ${product.stockQuantity} disponible(s)`
                                : ""}
                            </small>
                          </span>
                          <Input
                            min="0"
                            name={`quantity-${product.id}`}
                            type="number"
                            defaultValue="0"
                            className="text-center"
                          />
                        </label>
                      ))}
                    </div>

                    <Input
                      name="customerName"
                      placeholder="Nom et prenom"
                      required
                    />
                    <Input
                      name="customerEmail"
                      placeholder="Email"
                      required
                      type="email"
                    />
                    <Input name="customerPhone" placeholder="Telephone" />
                    <Input name="yeshiva" placeholder="Yeshiva" />
                    <Input
                      name="arrivalDate"
                      type="date"
                      aria-label="Date d'arrivee"
                    />
                    <Textarea
                      name="note"
                      placeholder="Note pour l'equipe : livraison, adresse, besoin particulier..."
                    />

                    {storefront.pickupDetails && (
                      <p className="rounded-lg bg-[var(--subtle)] p-3 text-sm text-[var(--muted)]">
                        {storefront.pickupDetails}
                      </p>
                    )}

                    <Button disabled={!storefront.active || products.length === 0}>
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
