-- AlterEnum
ALTER TYPE "BookingFulfillmentStatus" ADD VALUE 'MISSED';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "canceledById" TEXT;
