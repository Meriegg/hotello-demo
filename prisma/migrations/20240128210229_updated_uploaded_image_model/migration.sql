/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `UploadedImage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uploadedById` to the `UploadedImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UploadedImage" ADD COLUMN     "uploadedById" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UploadedImage_url_key" ON "UploadedImage"("url");

-- AddForeignKey
ALTER TABLE "UploadedImage" ADD CONSTRAINT "UploadedImage_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
