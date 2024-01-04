-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "billingdetails_address" TEXT,
ADD COLUMN     "billingdetails_cityOrTown" TEXT,
ADD COLUMN     "billingdetails_countryOrRegion" TEXT,
ADD COLUMN     "billingdetails_postalCode" TEXT,
ADD COLUMN     "personaldetails_age" INTEGER,
ADD COLUMN     "personaldetails_email" TEXT,
ADD COLUMN     "personaldetails_firstName" TEXT,
ADD COLUMN     "personaldetails_lastName" TEXT,
ADD COLUMN     "personaldetails_phoneNum" TEXT,
ADD COLUMN     "personaldetails_phoneNumCountry" TEXT;
