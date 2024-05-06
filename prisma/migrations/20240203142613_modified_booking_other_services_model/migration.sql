/*
  Warnings:

  - You are about to drop the column `otherServicesMetadata` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "otherServicesMetadata";

-- CreateTable
CREATE TABLE "BookingOtherService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "bookingId" TEXT NOT NULL,

    CONSTRAINT "BookingOtherService_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BookingOtherService" ADD CONSTRAINT "BookingOtherService_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
