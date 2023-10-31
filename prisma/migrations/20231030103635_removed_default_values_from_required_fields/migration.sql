-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "baseRoomsPrice" DROP DEFAULT,
ALTER COLUMN "calculatedStayInDays" DROP DEFAULT,
ALTER COLUMN "priceToPayOnCheckIn" DROP DEFAULT,
ALTER COLUMN "reservationHoldPrice" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BookingRoom" ALTER COLUMN "calculatedStayInDays" DROP DEFAULT,
ALTER COLUMN "finalPriceForRoom" DROP DEFAULT;
