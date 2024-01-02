/*
  Warnings:

  - You are about to alter the column `finalPriceForRoom` on the `BookingRoom` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to drop the column `discountPercentage` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `discountedPrice` on the `Room` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Room` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "BookingRoom" ALTER COLUMN "finalPriceForRoom" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "discountPercentage",
DROP COLUMN "discountedPrice",
ALTER COLUMN "price" SET DATA TYPE INTEGER;
