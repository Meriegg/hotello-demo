-- AlterTable
ALTER TABLE "CheckoutSession" ADD COLUMN     "createdBookingId" TEXT;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "checkoutSessionId" TEXT;

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_createdBookingId_fkey" FOREIGN KEY ("createdBookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
