CREATE TYPE "StoreReservationReceptionMode" AS ENUM ('PICKUP', 'DELIVERY');

ALTER TABLE "StoreReservation"
  ADD COLUMN "receptionMode" "StoreReservationReceptionMode" NOT NULL DEFAULT 'PICKUP',
  ADD COLUMN "deliveryAddress" TEXT,
  ADD COLUMN "paid" BOOLEAN NOT NULL DEFAULT false;
