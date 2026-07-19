CREATE TYPE "StoreReservationStatus" AS ENUM (
  'SUBMITTED',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'COLLECTED',
  'CANCELED'
);

CREATE TABLE "Storefront" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL DEFAULT 'Boutique Bnei Yeshivot',
  "slug" TEXT NOT NULL DEFAULT 'boutique',
  "description" TEXT NOT NULL,
  "heroTitle" TEXT NOT NULL DEFAULT 'Boutique literie',
  "heroSubtitle" TEXT NOT NULL,
  "pickupDetails" TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Storefront_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoreProduct" (
  "id" TEXT NOT NULL,
  "storefrontId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "details" TEXT,
  "priceCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "imageUrl" TEXT,
  "stockQuantity" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreProduct_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoreReservation" (
  "id" TEXT NOT NULL,
  "storefrontId" TEXT NOT NULL,
  "userId" TEXT,
  "status" "StoreReservationStatus" NOT NULL DEFAULT 'SUBMITTED',
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT,
  "yeshiva" TEXT,
  "arrivalDate" TIMESTAMP(3),
  "note" TEXT,
  "adminNote" TEXT,
  "totalCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreReservation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoreReservationItem" (
  "id" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitCents" INTEGER NOT NULL,
  "productTitle" TEXT NOT NULL,
  CONSTRAINT "StoreReservationItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Storefront_slug_key" ON "Storefront"("slug");
CREATE UNIQUE INDEX "StoreProduct_slug_key" ON "StoreProduct"("slug");
CREATE INDEX "StoreProduct_storefrontId_active_idx" ON "StoreProduct"("storefrontId", "active");
CREATE INDEX "StoreReservation_status_createdAt_idx" ON "StoreReservation"("status", "createdAt");
CREATE INDEX "StoreReservation_customerEmail_idx" ON "StoreReservation"("customerEmail");

ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoreReservation" ADD CONSTRAINT "StoreReservation_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoreReservation" ADD CONSTRAINT "StoreReservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoreReservationItem" ADD CONSTRAINT "StoreReservationItem_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "StoreReservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoreReservationItem" ADD CONSTRAINT "StoreReservationItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "StoreProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
