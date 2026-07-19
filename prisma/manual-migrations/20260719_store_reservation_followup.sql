ALTER TABLE "StoreReservation" ADD COLUMN "pickupDate" TIMESTAMP(3);
ALTER TABLE "StoreReservation" ADD COLUMN "pickupLocation" TEXT;
ALTER TABLE "StoreReservation" ADD COLUMN "unavailableItems" TEXT;
