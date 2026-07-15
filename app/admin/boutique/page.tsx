import { StoreReservationStatus } from "@prisma/client";
import { PackagePlus, Save, Trash2 } from "lucide-react";
import {
  createStoreProduct,
  deleteStoreProduct,
  updateStoreProduct,
  updateStoreReservation,
  updateStorefront,
} from "../actions";
import { StatusBadge } from "@/app/components";
import { AdminShell } from "@/components/admin-sidebar";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdminUser } from "@/lib/session";
import { ensureDefaultStorefront, formatStorePrice } from "@/lib/store";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Admin boutique",
};

const statusLabels: Record<StoreReservationStatus, string> = {
  SUBMITTED: "Nouvelle",
  CONFIRMED: "Confirmee",
  PREPARING: "En preparation",
  READY: "Prete",
  COLLECTED: "Recuperee",
  CANCELED: "Annulee",
};

function statusTone(status: StoreReservationStatus) {
  if (status === "COLLECTED" || status === "READY") return "green";
  if (status === "CANCELED") return "gold";
  return "blue";
}

function moneyInput(cents: number) {
  return (cents / 100).toFixed(2);
}

export default async function AdminStorePage() {
  await requireAdminUser();
  const storefront = await ensureDefaultStorefront();
  const [products, reservations] = await Promise.all([
    prisma.storeProduct.findMany({
      where: { storefrontId: storefront.id },
      orderBy: [{ active: "desc" }, { featured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.storeReservation.findMany({
      where: { storefrontId: storefront.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <AdminShell>
      <div className="admin-header">
        <div>
          <span className="eyebrow">Back-office</span>
          <h1>Boutique</h1>
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Creation de boutique</CardTitle>
              <CardDescription>
                Texte public, contact et ouverture des reservations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateStorefront} className="grid gap-3">
                <Input name="name" defaultValue={storefront.name} required />
                <Input
                  name="heroTitle"
                  defaultValue={storefront.heroTitle}
                  required
                />
                <Textarea
                  name="heroSubtitle"
                  defaultValue={storefront.heroSubtitle}
                  required
                />
                <Textarea
                  name="description"
                  defaultValue={storefront.description}
                  required
                />
                <Textarea
                  name="pickupDetails"
                  defaultValue={storefront.pickupDetails ?? ""}
                  placeholder="Retrait, livraison, horaires..."
                />
                <Input
                  name="contactEmail"
                  defaultValue={storefront.contactEmail ?? ""}
                  placeholder="Email admin"
                  type="email"
                />
                <Input
                  name="contactPhone"
                  defaultValue={storefront.contactPhone ?? ""}
                  placeholder="Telephone"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    name="active"
                    type="checkbox"
                    defaultChecked={storefront.active}
                  />
                  Boutique ouverte aux reservations
                </label>
                <Button>
                  <Save className="size-4" />
                  Enregistrer la boutique
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nouveau produit</CardTitle>
              <CardDescription>
                Creez un produit reservable sans paiement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createStoreProduct} className="grid gap-3">
                <Input name="title" placeholder="Nom du produit" required />
                <Textarea
                  name="description"
                  placeholder="Description courte"
                  required
                />
                <Textarea
                  name="details"
                  placeholder="Details, contenu du pack, dimensions..."
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input name="price" placeholder="Prix" required />
                  <Input name="currency" defaultValue="EUR" />
                </div>
                <Input name="imageUrl" placeholder="URL image produit" />
                <Input
                  name="stockQuantity"
                  placeholder="Stock optionnel"
                  type="number"
                  min="0"
                />
                <div className="grid gap-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input name="active" type="checkbox" defaultChecked />
                    Produit visible
                  </label>
                  <label className="flex items-center gap-2">
                    <input name="featured" type="checkbox" />
                    Produit recommande
                  </label>
                </div>
                <Button>
                  <PackagePlus className="size-4" />
                  Creer le produit
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Produits</CardTitle>
              <CardDescription>
                {products.length} produit(s) configures pour la boutique.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {products.map((product) => (
                <form
                  action={updateStoreProduct}
                  className="grid gap-3 rounded-lg border border-[var(--border)] p-4"
                  key={product.id}
                >
                  <input name="productId" type="hidden" value={product.id} />
                  <div className="grid gap-3 md:grid-cols-[1fr_130px_90px]">
                    <Input name="title" defaultValue={product.title} required />
                    <Input
                      name="price"
                      defaultValue={moneyInput(product.priceCents)}
                      required
                    />
                    <Input name="currency" defaultValue={product.currency} />
                  </div>
                  <Textarea
                    name="description"
                    defaultValue={product.description}
                    required
                  />
                  <Textarea name="details" defaultValue={product.details ?? ""} />
                  <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                    <Input
                      name="imageUrl"
                      defaultValue={product.imageUrl ?? ""}
                      placeholder="URL image"
                    />
                    <Input
                      name="stockQuantity"
                      defaultValue={product.stockQuantity ?? ""}
                      min="0"
                      placeholder="Stock"
                      type="number"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          name="active"
                          type="checkbox"
                          defaultChecked={product.active}
                        />
                        Visible
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          name="featured"
                          type="checkbox"
                          defaultChecked={product.featured}
                        />
                        Recommande
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" type="submit">
                        Enregistrer
                      </Button>
                      <Button
                        formAction={deleteStoreProduct}
                        size="sm"
                        type="submit"
                        variant="ghost"
                      >
                        <Trash2 className="size-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </form>
              ))}
              {products.length === 0 && (
                <p className="text-base text-[var(--muted)]">
                  Aucun produit pour le moment.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reservations recues</CardTitle>
              <CardDescription>
                Les 100 dernieres reservations sans paiement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="table-wrap">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Produits</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Suivi admin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="align-top">
                          <strong>{reservation.customerName}</strong>
                          <span className="block text-sm text-[var(--muted)]">
                            {reservation.customerEmail}
                          </span>
                          {reservation.customerPhone && (
                            <span className="block text-sm text-[var(--muted)]">
                              {reservation.customerPhone}
                            </span>
                          )}
                          {reservation.yeshiva && (
                            <span className="block text-sm text-[var(--muted)]">
                              {reservation.yeshiva}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          {reservation.items.map((item) => (
                            <span className="block" key={item.id}>
                              {item.quantity} x {item.productTitle}
                            </span>
                          ))}
                          {reservation.note && (
                            <small className="mt-2 block text-[var(--muted)]">
                              Note: {reservation.note}
                            </small>
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          {formatStorePrice(
                            reservation.totalCents,
                            reservation.currency,
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          <StatusBadge tone={statusTone(reservation.status)}>
                            {statusLabels[reservation.status]}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="min-w-72 align-top">
                          <form action={updateStoreReservation} className="grid gap-2">
                            <input
                              name="reservationId"
                              type="hidden"
                              value={reservation.id}
                            />
                            <NativeSelect
                              className="w-full"
                              name="status"
                              defaultValue={reservation.status}
                            >
                              {Object.values(StoreReservationStatus).map(
                                (status) => (
                                  <NativeSelectOption key={status} value={status}>
                                    {statusLabels[status]}
                                  </NativeSelectOption>
                                ),
                              )}
                            </NativeSelect>
                            <Textarea
                              className="min-h-20"
                              name="adminNote"
                              defaultValue={reservation.adminNote ?? ""}
                              placeholder="Note interne"
                            />
                            <Button size="sm">Mettre a jour</Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {reservations.length === 0 && (
                <p className="py-6 text-center text-base text-[var(--muted)]">
                  Aucune reservation recue pour le moment.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </AdminShell>
  );
}
