/*
  Warnings:

  - You are about to drop the column `checkoutSessionId` on the `Room` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[checkoutSessionId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdBookingId]` on the table `CheckoutSession` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CheckoutSession" DROP CONSTRAINT "CheckoutSession_createdBookingId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_checkoutSessionId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "checkoutSessionId" TEXT;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "checkoutSessionId";

-- CreateIndex
CREATE UNIQUE INDEX "Booking_checkoutSessionId_key" ON "Booking"("checkoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSession_createdBookingId_key" ON "CheckoutSession"("createdBookingId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
