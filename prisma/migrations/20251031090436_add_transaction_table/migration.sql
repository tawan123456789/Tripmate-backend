-- CreateEnum
CREATE TYPE "public"."TransactionMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'PROMPTPAY', 'E_WALLET', 'QR');

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "tx_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "booking_id" TEXT NOT NULL,
    "method" "public"."TransactionMethod",
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("tx_id")
);

-- CreateIndex
CREATE INDEX "Transaction_user_id_idx" ON "public"."Transaction"("user_id");

-- CreateIndex
CREATE INDEX "Transaction_booking_id_idx" ON "public"."Transaction"("booking_id");

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."Booking"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;
