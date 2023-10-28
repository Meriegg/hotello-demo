/*
  Warnings:

  - You are about to drop the column `billingFinalCurrency` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `priceCurrency` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `currentCurrency` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "billingFinalCurrency";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "priceCurrency";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "currentCurrency";

-- DropEnum
DROP TYPE "SupportedCurrencies";
