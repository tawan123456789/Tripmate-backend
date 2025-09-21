/*
  Warnings:

  - The primary key for the `Table` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "public"."Table" DROP CONSTRAINT "Table_pkey",
ADD CONSTRAINT "Table_pkey" PRIMARY KEY ("table_id", "restaurant_id");
