-- DropForeignKey
ALTER TABLE "BookingRoomGuestDetails" DROP CONSTRAINT "BookingRoomGuestDetails_bookingUserId_fkey";

-- AlterTable
ALTER TABLE "BookingRoomGuestDetails" ALTER COLUMN "bookingUserId" DROP NOT NULL,
ALTER COLUMN "bookingUserId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "BookingRoomGuestDetails" ADD CONSTRAINT "BookingRoomGuestDetails_bookingUserId_fkey" FOREIGN KEY ("bookingUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
