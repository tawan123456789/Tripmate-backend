-- AlterTable
ALTER TABLE "public"."Guide" ADD COLUMN     "language" TEXT,
ADD COLUMN     "pay" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."Restaurant" ADD COLUMN     "price_level" INTEGER;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "username" DROP DEFAULT;
