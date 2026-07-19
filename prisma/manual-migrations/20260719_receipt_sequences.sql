CREATE TABLE "ReceiptSequence" (
  "fiscalYear" INTEGER NOT NULL,
  "lastNumber" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ReceiptSequence_pkey" PRIMARY KEY ("fiscalYear")
);

INSERT INTO "ReceiptSequence" ("fiscalYear", "lastNumber", "updatedAt")
SELECT
  "fiscalYear",
  COALESCE(
    MAX(
      CASE
        WHEN "number" ~ '^CERFA-[0-9]{4}-[0-9]+$'
          THEN split_part("number", '-', 3)::INTEGER
        WHEN "number" ~ '^[0-9]+$'
          THEN "number"::INTEGER
        ELSE NULL
      END
    ),
    COUNT(*)
  )::INTEGER AS "lastNumber",
  CURRENT_TIMESTAMP
FROM "Receipt"
GROUP BY "fiscalYear"
ON CONFLICT ("fiscalYear") DO UPDATE SET
  "lastNumber" = GREATEST("ReceiptSequence"."lastNumber", EXCLUDED."lastNumber"),
  "updatedAt" = CURRENT_TIMESTAMP;
