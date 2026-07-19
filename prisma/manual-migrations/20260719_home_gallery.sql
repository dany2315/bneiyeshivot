DO $$ BEGIN
  CREATE TYPE "HomeGalleryItemType" AS ENUM ('IMAGE', 'VIDEO', 'YOUTUBE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "HomeGalleryAlbum" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HomeGalleryAlbum_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HomeGalleryItem" (
  "id" TEXT NOT NULL,
  "albumId" TEXT NOT NULL,
  "type" "HomeGalleryItemType" NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "key" TEXT,
  "url" TEXT,
  "mimeType" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HomeGalleryItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "HomeGalleryAlbum_active_sortOrder_idx" ON "HomeGalleryAlbum"("active", "sortOrder");
CREATE INDEX IF NOT EXISTS "HomeGalleryItem_albumId_sortOrder_idx" ON "HomeGalleryItem"("albumId", "sortOrder");

DO $$ BEGIN
  ALTER TABLE "HomeGalleryItem"
    ADD CONSTRAINT "HomeGalleryItem_albumId_fkey"
    FOREIGN KEY ("albumId") REFERENCES "HomeGalleryAlbum"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
