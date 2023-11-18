/*
  Warnings:

  - You are about to drop the column `cartDataCookie` on the `CheckoutSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CheckoutSession" DROP COLUMN "cartDataCookie",
ADD COLUMN     "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "productIds" TEXT[],
ADD COLUMN     "productJsonCopy" JSONB;
