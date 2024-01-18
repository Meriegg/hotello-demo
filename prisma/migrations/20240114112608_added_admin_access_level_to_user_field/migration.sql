-- CreateEnum
CREATE TYPE "AdminAccessLevel" AS ENUM ('LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminAccessLevel" "AdminAccessLevel" NOT NULL DEFAULT 'LEVEL_0';
