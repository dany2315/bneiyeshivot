CREATE TABLE "StoreProductVariant" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "size" TEXT NOT NULL,
  "cut" TEXT,
  "stockQuantity" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StoreProductVariant_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StoreProductVariant_productId_active_idx" ON "StoreProductVariant"("productId", "active");
CREATE UNIQUE INDEX "StoreProductVariant_productId_size_cut_key" ON "StoreProductVariant"("productId", "size", "cut");

ALTER TABLE "StoreProductVariant"
  ADD CONSTRAINT "StoreProductVariant_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "StoreProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StoreReservationItem"
  ADD COLUMN "productVariantId" TEXT,
  ADD COLUMN "variantLabel" TEXT;

CREATE INDEX "StoreReservationItem_productVariantId_idx" ON "StoreReservationItem"("productVariantId");

ALTER TABLE "StoreReservationItem"
  ADD CONSTRAINT "StoreReservationItem_productVariantId_fkey"
  FOREIGN KEY ("productVariantId") REFERENCES "StoreProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StoreProduct" ALTER COLUMN "currency" SET DEFAULT 'ILS';
ALTER TABLE "StoreReservation" ALTER COLUMN "currency" SET DEFAULT 'ILS';
UPDATE "StoreProduct" SET "currency" = 'ILS';
