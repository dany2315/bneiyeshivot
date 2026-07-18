"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { StoreReservationStatus } from "@prisma/client";
import {
  Bell,
  CheckCircle2,
  Edit,
  Eye,
  EyeOff,
  PackagePlus,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createStoreProduct,
  deleteStoreProduct,
  setStoreProductActive,
  updateStoreProduct,
  updateStoreReservation,
  updateStorefront,
} from "@/app/admin/actions";
import { StatusBadge } from "@/app/components";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type StorefrontView = {
  id: string;
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  description: string;
  pickupDetails: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  active: boolean;
};

type ProductView = {
  id: string;
  title: string;
  description: string;
  details: string | null;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  stockQuantity: number | null;
  active: boolean;
  featured: boolean;
};

type ReservationView = {
  id: string;
  status: StoreReservationStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  yeshiva: string | null;
  arrivalDate: string | null;
  pickupDate: string | null;
  pickupLocation: string | null;
  unavailableItems: string | null;
  note: string | null;
  adminNote: string | null;
  totalCents: number;
  currency: string;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitCents: number;
    productTitle: string;
  }>;
};

type SupplyView = {
  productId: string;
  title: string;
  orderedQuantity: number;
  stockQuantity: number | null;
  missingQuantity: number | null;
  active: boolean;
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

function formatPrice(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function moneyInput(cents: number) {
  return (cents / 100).toFixed(2);
}

function formatDateTime(value: string | null) {
  if (!value) return "Non renseigne";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Une erreur est survenue. Reessayez.";
}

function InteractiveForm({
  action,
  children,
  className,
  successMessage,
}: {
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  className?: string;
  successMessage: string;
}) {
  return (
    <form
      action={async (formData) => {
        try {
          await action(formData);
          toast.success(successMessage);
        } catch (error) {
          toast.error(errorMessage(error));
        }
      }}
      className={className}
    >
      {children}
    </form>
  );
}

function SubmitButton({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "secondary" | "destructive";
}) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant={variant}>
      {pending ? "Enregistrement..." : children}
    </Button>
  );
}

export function AdminStorePageClient({
  storefront,
  products,
  reservations,
  supplyOverview,
}: {
  storefront: StorefrontView;
  products: ProductView[];
  reservations: ReservationView[];
  supplyOverview: SupplyView[];
}) {
  const openReservations = reservations.filter(
    (reservation) =>
      reservation.status !== "COLLECTED" && reservation.status !== "CANCELED",
  );
  const reservedUnits = openReservations.reduce(
    (total, reservation) =>
      total +
      reservation.items.reduce((itemsTotal, item) => itemsTotal + item.quantity, 0),
    0,
  );

  return (
    <div className="grid gap-5">
      <div className="admin-header">
        <div>
          <span className="eyebrow">Back-office</span>
          <h1>Boutique</h1>
        </div>
        <ProductDialog mode="create" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{reservations.length}</CardTitle>
            <CardDescription>Reservations recues</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{openReservations.length}</CardTitle>
            <CardDescription>Reservations a suivre</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{reservedUnits}</CardTitle>
            <CardDescription>Articles a preparer ou ravitailler</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="reservations">
        <TabsList className="flex w-full flex-wrap justify-start border-transparent bg-[var(--primary)]">
          <TabsTrigger
            className="!text-white hover:bg-white/10 hover:!text-white data-active:bg-white data-active:!text-[var(--primary)]"
            value="reservations"
          >
            Reservations
          </TabsTrigger>
          <TabsTrigger
            className="!text-white hover:bg-white/10 hover:!text-white data-active:bg-white data-active:!text-[var(--primary)]"
            value="products"
          >
            Produits
          </TabsTrigger>
          <TabsTrigger
            className="!text-white hover:bg-white/10 hover:!text-white data-active:bg-white data-active:!text-[var(--primary)]"
            value="supply"
          >
            Approvisionnement
          </TabsTrigger>
          <TabsTrigger
            className="!text-white hover:bg-white/10 hover:!text-white data-active:bg-white data-active:!text-[var(--primary)]"
            value="settings"
          >
            Parametres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reservations">
          <ReservationsTab reservations={reservations} />
        </TabsContent>

        <TabsContent value="products">
          <ProductsTab products={products} />
        </TabsContent>

        <TabsContent value="supply">
          <SupplyTab supplyOverview={supplyOverview} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab storefront={storefront} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProductsTab({ products }: { products: ProductView[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Produits</CardTitle>
          <CardDescription>
            {products.length} produit(s) configures pour la boutique.
          </CardDescription>
        </div>
        <ProductDialog mode="create" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <strong>{product.title}</strong>
                  <span className="block max-w-xl text-sm text-[var(--muted)]">
                    {product.description}
                  </span>
                  {product.featured ? (
                    <Badge className="mt-2" variant="success">
                      Recommande
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell>{formatPrice(product.priceCents, product.currency)}</TableCell>
                <TableCell>
                  {product.stockQuantity == null
                    ? "Non limite"
                    : product.stockQuantity}
                </TableCell>
                <TableCell>
                  <Badge variant={product.active ? "success" : "outline"}>
                    {product.active ? "Visible" : "Masque"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <ProductDialog mode="edit" product={product} />
                    <ProductActiveDialog product={product} />
                    <ProductDeleteDialog product={product} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {products.length === 0 ? (
          <p className="py-6 text-center text-base text-[var(--muted)]">
            Aucun produit pour le moment.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ProductDialog({
  mode,
  product,
}: {
  mode: "create" | "edit";
  product?: ProductView;
}) {
  const isEdit = mode === "edit";

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size={isEdit ? "icon-sm" : "default"} variant={isEdit ? "secondary" : "default"} />
        }
      >
        {isEdit ? (
          <>
            <Edit className="size-4" />
            <span className="sr-only">Modifier</span>
          </>
        ) : (
          <>
            <PackagePlus className="size-4" />
            Nouveau produit
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
          <DialogDescription>
            Gere le nom, le prix, la visibilite et le stock disponible.
          </DialogDescription>
        </DialogHeader>
        <InteractiveForm
          action={isEdit ? updateStoreProduct : createStoreProduct}
          className="grid gap-3"
          successMessage={isEdit ? "Produit modifie." : "Produit cree."}
        >
          {product ? <input name="productId" type="hidden" value={product.id} /> : null}
          <Input name="title" placeholder="Nom du produit" defaultValue={product?.title} required />
          <Textarea
            name="description"
            placeholder="Description courte"
            defaultValue={product?.description}
            required
          />
          <Textarea
            name="details"
            placeholder="Details, contenu du pack, dimensions..."
            defaultValue={product?.details ?? ""}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="price"
              placeholder="Prix"
              defaultValue={product ? moneyInput(product.priceCents) : ""}
              required
            />
            <Input name="currency" defaultValue={product?.currency ?? "EUR"} />
          </div>
          <Input name="imageUrl" placeholder="URL image produit" defaultValue={product?.imageUrl ?? ""} />
          <Input
            name="stockQuantity"
            placeholder="Stock optionnel"
            type="number"
            min="0"
            defaultValue={product?.stockQuantity ?? ""}
          />
          <div className="grid gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input name="active" type="checkbox" defaultChecked={product?.active ?? true} />
              Produit visible
            </label>
            <label className="flex items-center gap-2">
              <input name="featured" type="checkbox" defaultChecked={product?.featured ?? false} />
              Produit recommande
            </label>
          </div>
          <DialogFooter>
            <SubmitButton>
              <Save className="size-4" />
              Enregistrer
            </SubmitButton>
          </DialogFooter>
        </InteractiveForm>
      </DialogContent>
    </Dialog>
  );
}

function ProductActiveDialog({ product }: { product: ProductView }) {
  const nextActive = !product.active;

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button size="icon-sm" variant="ghost" />}>
        {nextActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        <span className="sr-only">{nextActive ? "Activer" : "Desactiver"}</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <InteractiveForm
          action={setStoreProductActive}
          successMessage={nextActive ? "Produit active." : "Produit masque."}
        >
          <input name="productId" type="hidden" value={product.id} />
          <input name="active" type="hidden" value={String(nextActive)} />
          <AlertDialogHeader>
            <AlertDialogTitle>
              {nextActive ? "Rendre visible ?" : "Masquer ce produit ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {nextActive
                ? "Le produit redeviendra reservable dans la boutique publique."
                : "Le produit restera dans l'admin mais ne sera plus reservable."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <SubmitButton variant="secondary">
              {nextActive ? "Activer" : "Desactiver"}
            </SubmitButton>
          </AlertDialogFooter>
        </InteractiveForm>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ProductDeleteDialog({ product }: { product: ProductView }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button size="icon-sm" variant="destructive" />}>
        <Trash2 className="size-4" />
        <span className="sr-only">Supprimer</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <InteractiveForm
          action={deleteStoreProduct}
          successMessage="Produit supprime ou masque."
        >
          <input name="productId" type="hidden" value={product.id} />
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              S&apos;il existe deja dans une reservation, il sera masque au lieu
              d&apos;etre supprime afin de conserver l&apos;historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <SubmitButton variant="destructive">
              Supprimer
            </SubmitButton>
          </AlertDialogFooter>
        </InteractiveForm>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ReservationsTab({ reservations }: { reservations: ReservationView[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservations recues</CardTitle>
        <CardDescription>
          Les 100 dernieres reservations sans paiement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Retrait</TableHead>
              <TableHead className="text-right">Suivi</TableHead>
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
                  {reservation.customerPhone ? (
                    <span className="block text-sm text-[var(--muted)]">
                      {reservation.customerPhone}
                    </span>
                  ) : null}
                  {reservation.yeshiva ? (
                    <span className="block text-sm text-[var(--muted)]">
                      {reservation.yeshiva}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="align-top">
                  {reservation.items.map((item) => (
                    <span className="block" key={item.id}>
                      {item.quantity} x {item.productTitle}
                    </span>
                  ))}
                  {reservation.note ? (
                    <small className="mt-2 block text-[var(--muted)]">
                      Note: {reservation.note}
                    </small>
                  ) : null}
                </TableCell>
                <TableCell className="align-top">
                  {formatPrice(reservation.totalCents, reservation.currency)}
                </TableCell>
                <TableCell className="align-top">
                  <StatusBadge tone={statusTone(reservation.status)}>
                    {statusLabels[reservation.status]}
                  </StatusBadge>
                </TableCell>
                <TableCell className="align-top">
                  <span className="block">{formatDateTime(reservation.pickupDate)}</span>
                  {reservation.pickupLocation ? (
                    <small className="block text-[var(--muted)]">
                      {reservation.pickupLocation}
                    </small>
                  ) : null}
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex justify-end">
                    <ReservationDialog reservation={reservation} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {reservations.length === 0 ? (
          <p className="py-6 text-center text-base text-[var(--muted)]">
            Aucune reservation recue pour le moment.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ReservationDialog({ reservation }: { reservation: ReservationView }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="secondary" />}>
        <Bell className="size-4" />
        Suivre
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Suivi reservation</DialogTitle>
          <DialogDescription>
            Confirme, renseigne le retrait et envoie une mise a jour au client.
          </DialogDescription>
        </DialogHeader>
        <InteractiveForm
          action={updateStoreReservation}
          className="grid gap-4"
          successMessage="Reservation mise a jour."
        >
          <input name="reservationId" type="hidden" value={reservation.id} />
          <div className="rounded-lg border border-[var(--border)] p-3">
            <strong>{reservation.customerName}</strong>
            <span className="block text-sm text-[var(--muted)]">
              {reservation.customerEmail}
            </span>
            <div className="mt-3 grid gap-1 text-sm">
              {reservation.items.map((item) => (
                <span key={item.id}>
                  {item.quantity} x {item.productTitle}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium">
              Statut
              <NativeSelect name="status" defaultValue={reservation.status}>
                {Object.values(StoreReservationStatus).map((status) => (
                  <NativeSelectOption key={status} value={status}>
                    {statusLabels[status]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Date de recuperation
              <Input
                name="pickupDate"
                type="datetime-local"
                defaultValue={toDatetimeLocal(reservation.pickupDate)}
              />
            </label>
          </div>
          <Input
            name="pickupLocation"
            placeholder="Lieu de recuperation"
            defaultValue={reservation.pickupLocation ?? ""}
          />
          <Textarea
            name="unavailableItems"
            placeholder="Produits indisponibles ou ajustements proposes"
            defaultValue={reservation.unavailableItems ?? ""}
          />
          <Textarea
            name="adminNote"
            placeholder="Note interne admin"
            defaultValue={reservation.adminNote ?? ""}
          />
          <Textarea
            name="customerMessage"
            placeholder="Message a ajouter dans l'email client"
          />
          <label className="flex items-center gap-2 text-sm">
            <input name="notifyCustomer" type="checkbox" />
            Notifier le client par email
          </label>
          <DialogFooter>
            <SubmitButton>
              <CheckCircle2 className="size-4" />
              Mettre a jour
            </SubmitButton>
          </DialogFooter>
        </InteractiveForm>
      </DialogContent>
    </Dialog>
  );
}

function SupplyTab({ supplyOverview }: { supplyOverview: SupplyView[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approvisionnement</CardTitle>
        <CardDescription>
          Compte uniquement les reservations non recuperees et non annulees.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Quantite reservee</TableHead>
              <TableHead>Stock saisi</TableHead>
              <TableHead>A ravitailler</TableHead>
              <TableHead>Statut produit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supplyOverview.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  <strong>{item.title}</strong>
                </TableCell>
                <TableCell>{item.orderedQuantity}</TableCell>
                <TableCell>
                  {item.stockQuantity == null ? "Non renseigne" : item.stockQuantity}
                </TableCell>
                <TableCell>
                  {item.missingQuantity == null ? (
                    <Badge variant="warning">Stock a saisir</Badge>
                  ) : item.missingQuantity > 0 ? (
                    <Badge variant="destructive">{item.missingQuantity}</Badge>
                  ) : (
                    <Badge variant="success">OK</Badge>
                  )}
                </TableCell>
                <TableCell>{item.active ? "Visible" : "Masque"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Quand une reservation passe en Recuperee ou Annulee, ses articles ne
          comptent plus dans les besoins de ravitaillement.
        </p>
      </CardContent>
    </Card>
  );
}

function SettingsTab({ storefront }: { storefront: StorefrontView }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parametres boutique</CardTitle>
        <CardDescription>
          Texte public, contact et ouverture des reservations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InteractiveForm
          action={updateStorefront}
          className="grid gap-3"
          successMessage="Parametres boutique enregistres."
        >
          <Input name="name" defaultValue={storefront.name} required />
          <Input name="heroTitle" defaultValue={storefront.heroTitle} required />
          <Textarea
            name="heroSubtitle"
            defaultValue={storefront.heroSubtitle}
            required
          />
          <Textarea name="description" defaultValue={storefront.description} required />
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
            <input name="active" type="checkbox" defaultChecked={storefront.active} />
            Boutique ouverte aux reservations
          </label>
          <SubmitButton>
            <Settings className="size-4" />
            Enregistrer les parametres
          </SubmitButton>
        </InteractiveForm>
      </CardContent>
    </Card>
  );
}
