-- CreateEnum
CREATE TYPE "CheckoutStep" AS ENUM ('PERSONAL_DETAILS', 'BILLING_DETAILS', 'BOOKING_DETAILS', 'REVIEW_INFORMATION', 'FINAL_PAYMENT');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "discountPercentage" DOUBLE PRECISION,
ADD COLUMN     "discountedPrice" DOUBLE PRECISION,
ADD COLUMN     "images" TEXT[];

-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" TEXT NOT NULL,
    "step" "CheckoutStep" NOT NULL DEFAULT 'PERSONAL_DETAILS',
    "cartDataCookie" TEXT NOT NULL,
    "personaldetails_firstName" TEXT,
    "personaldetails_lastName" TEXT,
    "personaldetails_phoneNum" TEXT,
    "personaldetails_age" INTEGER,
    "billingdetails_countryOrRegion" TEXT,
    "billingdetails_address" TEXT,
    "billingdetails_cityOrTown" TEXT,
    "billingdetails_postalCode" TEXT,
    "bookingdetails_checkIn" TIMESTAMP(3),
    "bookingdetails_checkOut" TIMESTAMP(3),
    "bookingdetails_guestInformation" JSONB,

    CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);
