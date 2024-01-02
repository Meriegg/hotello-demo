/*
  Warnings:

  - You are about to drop the column `isFullyPaid` on the `Booking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentIntentId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "isFullyPaid";

-- CreateIndex
CREATE UNIQUE INDEX "Booking_paymentIntentId_key" ON "Booking"("paymentIntentId");
