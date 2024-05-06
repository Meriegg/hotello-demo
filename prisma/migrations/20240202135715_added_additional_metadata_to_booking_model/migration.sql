-- CreateEnum
CREATE TYPE "BookingFulfillmentStatus" AS ENUM ('WAITING_FOR_CUSTOMER', 'CUSTOMER_CHECKED_IN_ON_TIME', 'CUSTOMER_CHECKED_IN_LATE', 'CUSTOMER_CHECKED_OUT_ON_TIME', 'CUSTOMER_CHECKED_OUT_EARLY');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "canceledOn" TIMESTAMP(3),
ADD COLUMN     "fulfillmentStatus" "BookingFulfillmentStatus" NOT NULL DEFAULT 'WAITING_FOR_CUSTOMER',
ADD COLUMN     "otherServicesMetadata" JSONB;
