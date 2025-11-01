-- CreateTable
CREATE TABLE "public"."GroupUserPayment" (
    "group_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "status" TEXT,
    "bank" TEXT,
    "account_no" TEXT,
    "promptpay_id" TEXT,

    CONSTRAINT "GroupUserPayment_pkey" PRIMARY KEY ("group_id","user_id")
);

-- AddForeignKey
ALTER TABLE "public"."GroupUserPayment" ADD CONSTRAINT "GroupUserPayment_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."Group"("group_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupUserPayment" ADD CONSTRAINT "GroupUserPayment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
