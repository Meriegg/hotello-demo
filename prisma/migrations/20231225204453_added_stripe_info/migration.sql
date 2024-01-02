/*
  Warnings:

  - You are about to alter the column `baseRoomsPrice` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `priceToPayOnCheckIn` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `reservationHoldPrice` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - Added the required column `paymentIntentId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `paymentType` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('IN_FULL', 'RESERVATION_HOLD');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'PENDING';
ALTER TYPE "PaymentStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentIntentId" TEXT NOT NULL,
DROP COLUMN "paymentType",
ADD COLUMN     "paymentType" "PaymentType" NOT NULL,
ALTER COLUMN "baseRoomsPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "priceToPayOnCheckIn" SET DATA TYPE INTEGER,
ALTER COLUMN "reservationHoldPrice" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "CheckoutSession" ADD COLUMN     "paymentIntentId" TEXT;

-- DropEnum
DROP TYPE "PaymentMethod";
