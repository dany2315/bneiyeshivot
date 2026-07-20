DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StoreVariantOptionType') THEN
    CREATE TYPE "StoreVariantOptionType" AS ENUM ('SIZE', 'CUT');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "StoreVariantOption" (
  "id" TEXT NOT NULL,
  "storefrontId" TEXT NOT NULL,
  "type" "StoreVariantOptionType" NOT NULL,
  "label" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoreVariantOption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StoreVariantOption_storefrontId_type_label_key"
  ON "StoreVariantOption"("storefrontId", "type", "label");

CREATE INDEX IF NOT EXISTS "StoreVariantOption_storefrontId_type_active_sortOrder_idx"
  ON "StoreVariantOption"("storefrontId", "type", "active", "sortOrder");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'StoreVariantOption_storefrontId_fkey'
  ) THEN
    ALTER TABLE "StoreVariantOption"
      ADD CONSTRAINT "StoreVariantOption_storefrontId_fkey"
      FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

INSERT INTO "StoreVariantOption" (
  "id",
  "storefrontId",
  "type",
  "label",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
SELECT
  'size_' || md5(product."storefrontId" || ':' || variant."size"),
  product."storefrontId",
  'SIZE'::"StoreVariantOptionType",
  variant."size",
  row_number() OVER (PARTITION BY product."storefrontId" ORDER BY lower(variant."size")) - 1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT "productId", trim("size") AS "size"
  FROM "StoreProductVariant"
  WHERE trim("size") <> ''
) variant
JOIN "StoreProduct" product ON product."id" = variant."productId"
ON CONFLICT ("storefrontId", "type", "label") DO NOTHING;

INSERT INTO "StoreVariantOption" (
  "id",
  "storefrontId",
  "type",
  "label",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
SELECT
  'cut_' || md5(product."storefrontId" || ':' || variant."cut"),
  product."storefrontId",
  'CUT'::"StoreVariantOptionType",
  variant."cut",
  row_number() OVER (PARTITION BY product."storefrontId" ORDER BY lower(variant."cut")) - 1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT "productId", trim("cut") AS "cut"
  FROM "StoreProductVariant"
  WHERE "cut" IS NOT NULL AND trim("cut") <> ''
) variant
JOIN "StoreProduct" product ON product."id" = variant."productId"
ON CONFLICT ("storefrontId", "type", "label") DO NOTHING;
