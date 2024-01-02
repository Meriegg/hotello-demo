-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "customerCheckIn" TIMESTAMP(3),
ADD COLUMN     "customerCheckOut" TIMESTAMP(3),
ADD COLUMN     "otherServicesPrice" INTEGER DEFAULT 0;
