-- Manual migration for an existing database without Prisma migration history.
-- Do not run `prisma migrate reset` on production data.

-- Prix optionnel par variation. NULL signifie que la variation utilise le prix
-- de base du produit (prix identique pour toutes les variations).
ALTER TABLE "StoreProductVariant"
  ADD COLUMN IF NOT EXISTS "priceCents" INTEGER;
