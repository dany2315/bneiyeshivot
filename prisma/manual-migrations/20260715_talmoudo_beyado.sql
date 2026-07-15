-- Manual migration for an existing database without Prisma migration history.
-- Do not run `prisma migrate reset` on production data.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "parentPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "yeshiva" TEXT,
  ADD COLUMN IF NOT EXISTS "programType" TEXT;

ALTER TABLE "MivhanSession"
  ADD COLUMN IF NOT EXISTS "registrationCloseDaysBefore" INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS "registrationsClosed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "MivhanRegistration"
  ADD COLUMN IF NOT EXISTS "firstName" TEXT,
  ADD COLUMN IF NOT EXISTS "lastName" TEXT,
  ADD COLUMN IF NOT EXISTS "email" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "yeshiva" TEXT,
  ADD COLUMN IF NOT EXISTS "massehet" TEXT,
  ADD COLUMN IF NOT EXISTS "dapim" TEXT,
  ADD COLUMN IF NOT EXISTS "dafStart" TEXT,
  ADD COLUMN IF NOT EXISTS "dafEnd" TEXT,
  ADD COLUMN IF NOT EXISTS "rewardAmountCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "rewardCurrency" TEXT NOT NULL DEFAULT 'ILS',
  ADD COLUMN IF NOT EXISTS "rewardPaid" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "resultPublishedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "resultEmailSentAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "MivhanRegistration_email_idx"
  ON "MivhanRegistration"("email");

CREATE UNIQUE INDEX IF NOT EXISTS "MivhanRegistration_sessionId_userId_key"
  ON "MivhanRegistration"("sessionId", "userId");
