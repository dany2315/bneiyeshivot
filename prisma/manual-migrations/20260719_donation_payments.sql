CREATE TABLE "DonationPayment" (
  "id" TEXT NOT NULL,
  "donationId" TEXT NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amountCents" INTEGER NOT NULL,
  "refundedAmountCents" INTEGER NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL,
  "installmentNumber" INTEGER,
  "installmentTotal" INTEGER,
  "billingReason" TEXT,
  "stripeInvoiceId" TEXT,
  "stripePaymentIntentId" TEXT,
  "stripeChargeId" TEXT,
  "stripeReceiptUrl" TEXT,
  "stripeReceiptNumber" TEXT,
  "failureReason" TEXT,
  "periodStart" TIMESTAMP(3),
  "periodEnd" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "refundedAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DonationPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DonationPayment_stripeInvoiceId_key" ON "DonationPayment"("stripeInvoiceId");
CREATE UNIQUE INDEX "DonationPayment_stripePaymentIntentId_key" ON "DonationPayment"("stripePaymentIntentId");
CREATE UNIQUE INDEX "DonationPayment_stripeChargeId_key" ON "DonationPayment"("stripeChargeId");
CREATE INDEX "DonationPayment_donationId_createdAt_idx" ON "DonationPayment"("donationId", "createdAt");
CREATE INDEX "DonationPayment_status_createdAt_idx" ON "DonationPayment"("status", "createdAt");

ALTER TABLE "DonationPayment"
  ADD CONSTRAINT "DonationPayment_donationId_fkey"
  FOREIGN KEY ("donationId") REFERENCES "Donation"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
