/*
  Warnings:

  - You are about to drop the column `billingFinalPrice` on the `Booking` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Room` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `discountPercentage` on the `Room` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `discountedPrice` on the `Room` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "billingFinalPrice",
ADD COLUMN     "baseRoomsPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "calculatedStayInDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "priceToPayOnCheckIn" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "reservationHoldPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "BookingRoom" ADD COLUMN     "billingRoomCopy" JSONB,
ADD COLUMN     "calculatedStayInDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "finalPriceForRoom" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "BookingRoomGuestDetails" ADD COLUMN     "bookingUserId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "discountPercentage" SET DATA TYPE INTEGER,
ALTER COLUMN "discountedPrice" SET DATA TYPE DECIMAL(12,2);

-- AddForeignKey
ALTER TABLE "BookingRoomGuestDetails" ADD CONSTRAINT "BookingRoomGuestDetails_bookingUserId_fkey" FOREIGN KEY ("bookingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
