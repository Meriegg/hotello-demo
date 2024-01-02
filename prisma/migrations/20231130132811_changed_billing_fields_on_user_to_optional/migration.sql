/*
  Warnings:

  - You are about to drop the column `metadataSignedUpFromCheckout` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "metadataSignedUpFromCheckout",
ADD COLUMN     "signedUpFromCheckout" BOOLEAN DEFAULT false,
ALTER COLUMN "billingRegion" DROP NOT NULL,
ALTER COLUMN "billingAddress" DROP NOT NULL,
ALTER COLUMN "billingCityTown" DROP NOT NULL,
ALTER COLUMN "billingPostalCode" DROP NOT NULL;
