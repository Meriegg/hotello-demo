/*
  Warnings:

  - You are about to drop the column `billingdetails_address` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `billingdetails_cityOrTown` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `billingdetails_countryOrRegion` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `billingdetails_postalCode` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `personaldetails_age` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `personaldetails_email` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `personaldetails_firstName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `personaldetails_lastName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `personaldetails_phoneNum` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `personaldetails_phoneNumCountry` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `billingDetailsAddress` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingDetailsCityOrTown` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingDetailsCountryOrRegion` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingDetailsPostalCode` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalDetailsAge` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalDetailsEmail` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalDetailsFirstName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalDetailsLastName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalDetailsPhoneNum` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalDetailsPhoneNumCountry` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "billingdetails_address",
DROP COLUMN "billingdetails_cityOrTown",
DROP COLUMN "billingdetails_countryOrRegion",
DROP COLUMN "billingdetails_postalCode",
DROP COLUMN "personaldetails_age",
DROP COLUMN "personaldetails_email",
DROP COLUMN "personaldetails_firstName",
DROP COLUMN "personaldetails_lastName",
DROP COLUMN "personaldetails_phoneNum",
DROP COLUMN "personaldetails_phoneNumCountry",
ADD COLUMN     "billingDetailsAddress" TEXT NOT NULL,
ADD COLUMN     "billingDetailsCityOrTown" TEXT NOT NULL,
ADD COLUMN     "billingDetailsCountryOrRegion" TEXT NOT NULL,
ADD COLUMN     "billingDetailsPostalCode" TEXT NOT NULL,
ADD COLUMN     "personalDetailsAge" INTEGER NOT NULL,
ADD COLUMN     "personalDetailsEmail" TEXT NOT NULL,
ADD COLUMN     "personalDetailsFirstName" TEXT NOT NULL,
ADD COLUMN     "personalDetailsLastName" TEXT NOT NULL,
ADD COLUMN     "personalDetailsPhoneNum" TEXT NOT NULL,
ADD COLUMN     "personalDetailsPhoneNumCountry" TEXT NOT NULL;
