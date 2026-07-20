"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { StoreReservationStatus } from "@prisma/client";
import {
  Bell,
  CheckCircle2,
  Edit,
  Eye,
  EyeOff,
  ImageIcon,
  PackagePlus,
  Save,
  Settings,
  Trash2,
  Upload,
  X,
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
import { fileUrl } from "@/lib/files";

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
  imageUrls: string[];
  stockQuantity: number | null;
  active: boolean;
  featured: boolean;
  variants: Array<{
    id: string;
    size: string;
    cut: string | null;
    stockQuantity: number | null;
    active: boolean;
  }>;
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
    variantLabel: string | null;
    quantity: number;
    unitCents: number;
    productTitle: string;
  }>;
};

type SupplyView = {
  productId: string;
  productVariantId: string | null;
  title: string;
  variantLabel: string | null;
  orderedQuantity: number;
  stockQuantity: number | null;
  missingQuantity: number | null;
  active: boolean;
};

const statusLabels: Record<StoreReservationStatus, string> = {
  SUBMITTED: "Nouvelle",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  READY: "Prête",
  COLLECTED: "Récupérée",
  CANCELED: "Annulée",
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
  if (!value) return "Non renseigné";

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
    : "Une erreur est survenue. Réessayez.";
}

async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("files", file);
  formData.append("prefix", "store/products");

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });
  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    keys?: string[];
    message?: string;
  } | null;

  if (!response.ok || !data?.ok || !data.keys?.[0]) {
    throw new Error(data?.message ?? "Upload échoué.");
  }

  return data.keys[0];
}

async function deleteProductImage(value: string) {
  if (!value.startsWith("store/products/")) {
    return;
  }

  const response = await fetch("/api/store/product-images", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: value }),
  });
  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    message?: string;
  } | null;

  if (!response.ok || !data?.ok) {
    throw new Error(data?.message ?? "Suppression image échouée.");
  }
}

function InteractiveForm({
  action,
  children,
  className,
  onSuccess,
  successMessage,
}: {
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  className?: string;
  onSuccess?: () => void;
  successMessage: string;
}) {
  return (
    <form
      action={async (formData) => {
        try {
          await action(formData);
          toast.success(successMessage);
          onSuccess?.();
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
  disabled,
  pendingLabel = "Enregistrement...",
  variant = "default",
}: {
  children: ReactNode;
  disabled?: boolean;
  pendingLabel?: string;
  variant?: "default" | "secondary" | "destructive";
}) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending || disabled} type="submit" variant={variant}>
      {pending ? pendingLabel : children}
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
            <CardDescription>Réservations à suivre</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{reservedUnits}</CardTitle>
            <CardDescription>Articles à préparer ou ravitailler</CardDescription>
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
            Paramètres
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
            {products.length} produit(s) configuré(s) pour la boutique.
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
                  <span className="block max-w-xl truncate text-sm text-[var(--muted)]">
                    {product.description}
                  </span>
                  {product.details ? (
                    <span className="block max-w-xl truncate text-xs text-[var(--muted)]">
                      {product.details}
                    </span>
                  ) : null}
                  {product.featured ? (
                    <Badge className="mt-2" variant="success">
                      Recommandé
                    </Badge>
                  ) : null}
                  {product.variants.length > 0 ? (
                    <span className="mt-2 flex flex-wrap gap-1">
                      {Array.from(new Set(product.variants.map((variant) => variant.size)))
                        .slice(0, 6)
                        .map((size) => (
                          <Badge key={size} variant="outline">
                            {size}
                          </Badge>
                        ))}
                    </span>
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
                    {product.active ? "Visible" : "Masqué"}
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
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [details, setDetails] = useState(product?.details ?? "");
  const [price, setPrice] = useState(product ? moneyInput(product.priceCents) : "");
  const currency = "ILS";
  const [variants, setVariants] = useState<ProductVariantFormItem[]>(
    product?.variants.map((variant) => ({
      localId: variant.id,
      id: variant.id,
      size: variant.size,
      cut: variant.cut ?? "",
      stockQuantity: variant.stockQuantity == null ? "" : String(variant.stockQuantity),
      active: variant.active,
    })) ?? [],
  );
  const initialImages =
    product?.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : product?.imageUrl
        ? [product.imageUrl]
        : [];
  const [images, setImages] = useState<ProductImageItem[]>(
    initialImages.map((value, index) => ({
      id: `existing-${index}-${value}`,
      value,
      preview: fileUrl(value),
      status: "done",
    })),
  );
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const imageUploadPending = images.some((image) => image.status === "uploading");
  const parsedPrice = Number(price.replace(",", "."));
  const previewPrice = formatPrice(
    Number.isFinite(parsedPrice) ? Math.round(parsedPrice * 100) : 0,
    currency,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
          <DialogDescription>
            Gère le nom, le prix, l’image, la visibilité et le stock disponible.
          </DialogDescription>
        </DialogHeader>
        <InteractiveForm
          action={async (formData) => {
            if (imageUploadPending) {
              throw new Error("Attendez la fin de l’upload des images avant d’enregistrer.");
            }

            await (isEdit ? updateStoreProduct : createStoreProduct)(formData);
          }}
          className="grid gap-5"
          onSuccess={() => setOpen(false)}
          successMessage={isEdit ? "Produit modifié." : "Produit créé."}
        >
          {product ? <input name="productId" type="hidden" value={product.id} /> : null}
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-3">
              <ProductImagesField
                images={images}
                onImagesChange={setImages}
              />
              <Input
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Nom du produit"
                required
                value={title}
              />
              <Textarea
                name="description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Description courte"
                required
                value={description}
              />
              <Textarea
                name="details"
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Détails, contenu du pack, dimensions..."
                value={details}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="price"
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Prix en shekels"
                  required
                  value={price}
                />
                <Input readOnly value="ILS" />
              </div>
              <input name="currency" type="hidden" value="ILS" />
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
                  <input
                    checked={featured}
                    name="featured"
                    onChange={(event) => setFeatured(event.target.checked)}
                    type="checkbox"
                  />
                  Produit recommandé
                </label>
              </div>
              <ProductVariantsField
                onVariantsChange={setVariants}
                variants={variants}
              />
            </div>

            <ProductPreviewPanel
              currency={currency}
              description={description}
              details={details}
              featured={featured}
              imagePreview={images[0]?.preview ?? null}
              price={previewPrice}
              title={title}
            />
          </div>
          <DialogFooter>
            <SubmitButton disabled={imageUploadPending} pendingLabel="Enregistrement...">
              <Save className="size-4" />
              {imageUploadPending ? "Upload des images..." : "Enregistrer"}
            </SubmitButton>
          </DialogFooter>
        </InteractiveForm>
      </DialogContent>
    </Dialog>
  );
}

type ProductVariantFormItem = {
  localId: string;
  id?: string;
  size: string;
  cut: string;
  stockQuantity: string;
  active: boolean;
};

function ProductVariantsField({
  onVariantsChange,
  variants,
}: {
  onVariantsChange: Dispatch<SetStateAction<ProductVariantFormItem[]>>;
  variants: ProductVariantFormItem[];
}) {
  function addVariant() {
    onVariantsChange((current) => [
      ...current,
      {
        localId: `new-${Date.now()}`,
        size: "",
        cut: "",
        stockQuantity: "",
        active: true,
      },
    ]);
  }

  function updateVariant(
    localId: string,
    next: Partial<ProductVariantFormItem>,
  ) {
    onVariantsChange((current) =>
      current.map((variant) =>
        variant.localId === localId ? { ...variant, ...next } : variant,
      ),
    );
  }

  function removeVariant(localId: string) {
    onVariantsChange((current) =>
      current.filter((variant) => variant.localId !== localId),
    );
  }

  return (
    <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <strong className="text-sm text-[var(--primary)]">Variations</strong>
          <p className="text-xs text-[var(--muted)]">
            Ajoutez des tailles, puis une coupe si nécessaire.
          </p>
        </div>
        <Button onClick={addVariant} size="sm" type="button" variant="secondary">
          Ajouter
        </Button>
      </div>
      {variants.length > 0 ? (
        <div className="grid gap-2">
          {variants.map((variant, index) => (
            <div
              className="grid gap-2 rounded-lg bg-[var(--subtle)] p-2 md:grid-cols-[1fr_1fr_120px_auto_auto]"
              key={variant.localId}
            >
              <input name="variantId" type="hidden" value={variant.id ?? ""} />
              <Input
                name="variantSize"
                onChange={(event) =>
                  updateVariant(variant.localId, { size: event.target.value })
                }
                placeholder="Taille"
                value={variant.size}
              />
              <Input
                name="variantCut"
                onChange={(event) =>
                  updateVariant(variant.localId, { cut: event.target.value })
                }
                placeholder="Coupe"
                value={variant.cut}
              />
              <Input
                min="0"
                name="variantStockQuantity"
                onChange={(event) =>
                  updateVariant(variant.localId, {
                    stockQuantity: event.target.value,
                  })
                }
                placeholder="Stock"
                type="number"
                value={variant.stockQuantity}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={variant.active}
                  onChange={(event) =>
                    updateVariant(variant.localId, {
                      active: event.target.checked,
                    })
                  }
                  type="checkbox"
                />
                Visible
              </label>
              {variant.active ? (
                <input name="variantActiveIndex" type="hidden" value={index} />
              ) : null}
              <Button
                aria-label="Supprimer la variation"
                onClick={() => removeVariant(variant.localId)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-[var(--subtle)] p-3 text-sm text-[var(--muted)]">
          Aucune variation : le produit sera réservé sans taille ni coupe.
        </p>
      )}
    </div>
  );
}

type ProductImageItem = {
  id: string;
  value: string;
  preview: string | null;
  status: "uploading" | "done" | "error";
};

function ProductImagesField({
  images,
  onImagesChange,
}: {
  images: ProductImageItem[];
  onImagesChange: Dispatch<SetStateAction<ProductImageItem[]>>;
}) {
  const id = useId();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const uploading = images.some((image) => image.status === "uploading");

  function updateImage(idToUpdate: string, next: Partial<ProductImageItem>) {
    onImagesChange((current) =>
      current.map((image) =>
        image.id === idToUpdate ? { ...image, ...next } : image,
      ),
    );
  }

  function moveImage(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const sourceIndex = images.findIndex((image) => image.id === sourceId);
    const targetIndex = images.findIndex((image) => image.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    onImagesChange((current) => {
      const next = [...current];
      const [source] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, source);
      return next;
    });
  }

  function addManualUrl(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    onImagesChange((current) => [
      ...current,
      {
        id: `manual-${Date.now()}-${trimmed}`,
        value: trimmed,
        preview: fileUrl(trimmed),
        status: "done",
      },
    ]);
  }

  function handleFiles(files: File[]) {
    const created = files.map((file, index) => ({
      id: `upload-${Date.now()}-${index}-${file.name}`,
      file,
      value: "",
      preview: URL.createObjectURL(file),
      status: "uploading" as const,
    }));

    onImagesChange((current) => [
      ...current,
      ...created.map((item) => ({
        id: item.id,
        value: item.value,
        preview: item.preview,
        status: item.status,
      })),
    ]);

    for (const item of created) {
      uploadProductImage(item.file)
        .then((key) => {
          updateImage(item.id, {
            value: key,
            status: "done",
          });
        })
        .catch((error) => {
          updateImage(item.id, { status: "error" });
          toast.error(errorMessage(error));
        });
    }
  }

  async function removeImage(imageToRemove: ProductImageItem) {
    if (imageToRemove.status === "done" && imageToRemove.value) {
      setDeletingId(imageToRemove.id);
      try {
        await deleteProductImage(imageToRemove.value);
        toast.success("Image supprimée.");
      } catch (error) {
        toast.error(errorMessage(error));
        return;
      } finally {
        setDeletingId(null);
      }
    }

    onImagesChange((current) =>
      current.filter((image) => image.id !== imageToRemove.id),
    );
  }

  return (
    <div className="grid gap-3">
      {images.map((image) =>
        image.status === "done" && image.value ? (
          <input key={image.id} name="imageUrls" type="hidden" value={image.value} />
        ) : null,
      )}
      <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-white p-3">
        <label
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[var(--border)] bg-[var(--subtle)] p-3 text-sm font-bold text-[var(--primary)] transition hover:border-[var(--accent)]/40"
          htmlFor={id}
        >
          <Upload className="size-4" />
          {uploading ? "Upload en cours..." : "Uploader des images produit"}
        </label>
        <ManualImageUrlInput onAdd={addManualUrl} />
        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image, index) => (
              <div
                className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--subtle)]"
                draggable
                key={image.id}
                onDragEnd={() => setDraggedId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDragStart={() => setDraggedId(image.id)}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedId) moveImage(draggedId, image.id);
                  setDraggedId(null);
                }}
              >
                <span className="absolute left-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-white text-xs font-black text-[var(--primary)] shadow">
                  {index + 1}
                </span>
                <button
                  aria-label="Supprimer l’image"
                  className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-white text-[var(--primary)] shadow transition hover:bg-[var(--accent-soft)]"
                  disabled={deletingId === image.id}
                  onClick={() => removeImage(image)}
                  type="button"
                >
                  <X className="size-4" />
                </button>
                <div className="flex aspect-square items-center justify-center overflow-hidden">
                  {image.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={image.preview}
                    />
                  ) : (
                    <ImageIcon className="size-8 text-[var(--primary)]" />
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-[#061e35]/78 px-2 py-1 text-center text-xs font-bold text-white">
                  {image.status === "uploading"
                    ? "Upload..."
                    : image.status === "error"
                      ? "Échec"
                      : index === 0
                        ? "Image principale"
                        : "Glisser pour ordonner"}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <input
        accept="image/*"
        className="sr-only"
        id={id}
        multiple
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) handleFiles(files);
          event.target.value = "";
        }}
        type="file"
      />
    </div>
  );
}

function ManualImageUrlInput({ onAdd }: { onAdd: (value: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className="flex gap-2">
      <Input
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ou coller une URL image externe"
        value={value}
      />
      <Button
        onClick={() => {
          onAdd(value);
          setValue("");
        }}
        type="button"
        variant="secondary"
      >
        Ajouter
      </Button>
    </div>
  );
}

function ProductPreviewPanel({
  title,
  description,
  details,
  price,
  currency,
  imagePreview,
  featured,
}: {
  title: string;
  description: string;
  details: string;
  price: string;
  currency: string;
  imagePreview: string | null;
  featured: boolean;
}) {
  return (
    <div className="grid h-fit gap-4 rounded-xl bg-[var(--subtle)] p-4">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        Aperçu
      </span>
      <div>
        <p className="mb-2 text-sm font-semibold text-[var(--muted)]">
          Carte boutique
        </p>
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[0_20px_60px_rgba(6,40,70,0.08)]">
          <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-[var(--primary-soft)]">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-full w-full object-cover" src={imagePreview} />
            ) : (
              <ImageIcon className="size-10 text-[var(--primary)]" />
            )}
          </div>
          <div className="grid gap-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                {featured ? <Badge variant="success">Recommandé</Badge> : null}
                <strong className="mt-2 block text-[var(--primary)]">
                  {title || "Nom du produit"}
                </strong>
              </div>
              <strong className="text-lg text-[var(--primary)]">{price}</strong>
            </div>
            <p className="text-sm text-[var(--muted)]">
              {description || "Description courte du produit."}
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[var(--muted)]">
          Page produit
        </p>
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
          <div className="relative flex min-h-40 items-end overflow-hidden bg-[var(--primary)] p-4">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="absolute inset-0 h-full w-full object-cover" src={imagePreview} />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-[#061e35]/88 via-[#061e35]/45 to-transparent" />
            <div className="relative z-10 text-white">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/72">
                {currency}
              </span>
              <h3 className="mt-2 text-2xl font-bold">
                {title || "Nom du produit"}
              </h3>
              <p className="mt-1 text-lg font-black">{price}</p>
            </div>
          </div>
          <div className="grid gap-2 p-4">
            <p className="text-sm leading-6 text-[var(--primary)]">
              {description || "Description courte du produit."}
            </p>
            <p className="text-sm leading-6 text-[var(--muted)]">
              {details || "Détails, contenu du pack, dimensions..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductActiveDialog({ product }: { product: ProductView }) {
  const nextActive = !product.active;

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button size="icon-sm" variant="ghost" />}>
        {nextActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        <span className="sr-only">{nextActive ? "Activer" : "Désactiver"}</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <InteractiveForm
          action={setStoreProductActive}
          successMessage={nextActive ? "Produit activé." : "Produit masqué."}
        >
          <input name="productId" type="hidden" value={product.id} />
          <input name="active" type="hidden" value={String(nextActive)} />
          <AlertDialogHeader>
            <AlertDialogTitle>
              {nextActive ? "Rendre visible ?" : "Masquer ce produit ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {nextActive
                ? "Le produit redeviendra réservable dans la boutique publique."
                : "Le produit restera dans l’admin mais ne sera plus réservable."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <SubmitButton variant="secondary">
              {nextActive ? "Activer" : "Désactiver"}
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
          successMessage="Produit supprimé ou masqué."
        >
          <input name="productId" type="hidden" value={product.id} />
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              S’il existe déjà dans une réservation, il sera masqué au lieu
              d’être supprimé afin de conserver l’historique.
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
                      {item.variantLabel ? ` (${item.variantLabel})` : ""}
                    </span>
                  ))}
                  {reservation.note ? (
                    <small className="mt-2 block text-[var(--muted)]">
                      Note : {reservation.note}
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
            Aucune réservation reçue pour le moment.
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
          <DialogTitle>Suivi réservation</DialogTitle>
          <DialogDescription>
            Confirmez, renseignez le retrait et envoyez une mise à jour au client.
          </DialogDescription>
        </DialogHeader>
        <InteractiveForm
          action={updateStoreReservation}
          className="grid gap-4"
          successMessage="Réservation mise à jour."
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
                  {item.variantLabel ? ` (${item.variantLabel})` : ""}
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
              Date de récupération
              <Input
                name="pickupDate"
                type="datetime-local"
                defaultValue={toDatetimeLocal(reservation.pickupDate)}
              />
            </label>
          </div>
          <Input
            name="pickupLocation"
            placeholder="Lieu de récupération"
            defaultValue={reservation.pickupLocation ?? ""}
          />
          <Textarea
            name="unavailableItems"
            placeholder="Produits indisponibles ou ajustements proposés"
            defaultValue={reservation.unavailableItems ?? ""}
          />
          <Textarea
            name="adminNote"
            placeholder="Note interne admin"
            defaultValue={reservation.adminNote ?? ""}
          />
          <Textarea
            name="customerMessage"
            placeholder="Message à ajouter dans l’email client"
          />
          <label className="flex items-center gap-2 text-sm">
            <input name="notifyCustomer" type="checkbox" />
            Notifier le client par email
          </label>
          <DialogFooter>
            <SubmitButton>
              <CheckCircle2 className="size-4" />
              Mettre à jour
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
          Compte uniquement les réservations non récupérées et non annulées.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Quantité réservée</TableHead>
              <TableHead>Stock saisi</TableHead>
              <TableHead>À ravitailler</TableHead>
              <TableHead>Statut produit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supplyOverview.map((item) => (
              <TableRow key={`${item.productId}-${item.productVariantId ?? "base"}`}>
                <TableCell>
                  <strong>{item.title}</strong>
                  {item.variantLabel ? (
                    <small className="block text-[var(--muted)]">
                      {item.variantLabel}
                    </small>
                  ) : null}
                </TableCell>
                <TableCell>{item.orderedQuantity}</TableCell>
                <TableCell>
                  {item.stockQuantity == null ? "Non renseigné" : item.stockQuantity}
                </TableCell>
                <TableCell>
                  {item.missingQuantity == null ? (
                    <Badge variant="warning">Stock à saisir</Badge>
                  ) : item.missingQuantity > 0 ? (
                    <Badge variant="destructive">{item.missingQuantity}</Badge>
                  ) : (
                    <Badge variant="success">OK</Badge>
                  )}
                </TableCell>
                <TableCell>{item.active ? "Visible" : "Masqué"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Quand une réservation passe en Récupérée ou Annulée, ses articles ne
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
        <CardTitle>Paramètres boutique</CardTitle>
        <CardDescription>
          Texte public, contact et ouverture des réservations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InteractiveForm
          action={updateStorefront}
          className="grid gap-3"
          successMessage="Paramètres boutique enregistrés."
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
            placeholder="Téléphone"
          />
          <label className="flex items-center gap-2 text-sm">
            <input name="active" type="checkbox" defaultChecked={storefront.active} />
            Boutique ouverte aux reservations
          </label>
          <SubmitButton>
            <Settings className="size-4" />
            Enregistrer les paramètres
          </SubmitButton>
        </InteractiveForm>
      </CardContent>
    </Card>
  );
}
