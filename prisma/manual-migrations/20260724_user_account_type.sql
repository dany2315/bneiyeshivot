DO $$ BEGIN
  CREATE TYPE "UserAccountType" AS ENUM ('BAHOUR', 'YESHIVA');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "accountType" "UserAccountType" NOT NULL DEFAULT 'BAHOUR';
