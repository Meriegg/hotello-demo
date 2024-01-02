"use client";

import { CheckCircleIcon, Loader2, XCircleIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";

const Page = () => {
  const params = useParams();
  const router = useRouter();

  const paymentStatus = api.checkout.getBookingPaymentStatus.useQuery({
    bookingId: params?.bookingId as string ?? "",
  }, {
    retry: 500,
    cacheTime: 0,
    onSuccess: async (status) => {
      if (status === "PAID") {
        const promises = [
          await fetch("/api/removecookie", {
            method: "POST",
            body: JSON.stringify({
              cookieName: "cart",
            }),
          }),
          await fetch("/api/removecookie", {
            method: "POST",
            body: JSON.stringify({
              cookieName: "checkout",
            }),
          }),
        ];

        await Promise.all(promises);

        router.push(`/account/bookings/${params?.bookingId ?? "NO_ID"}`);
      }
    },
  });

  if (paymentStatus.error) {
    return (
      <div className="w-full flex flex-col gap-4 h-full items-center py-24 text-center">
        <XCircleIcon className="text-red-400 w-12 h-12" strokeWidth={1} />
        <p className="text-base text-red-400">
          An error happened, please refresh this page.
        </p>
      </div>
    );
  }

  return (
    <div>
      {paymentStatus.data === "PAID" && (
        <div className="w-full flex flex-col gap-4 h-full items-center py-24 text-center">
          <CheckCircleIcon
            className="text-green-600 w-12 h-12"
            strokeWidth={1}
          />
          <p className="text-base text-green-600">
            Your payment was a success, please wait while we redirect you.
          </p>
        </div>
      )}

      {paymentStatus.data === "PENDING" && (
        <div className="w-full flex flex-col gap-4 h-full items-center py-24 text-center">
          <Loader2
            className="text-neutral-700 w-12 h-12 animate-spin"
            strokeWidth={1}
          />
          <p className="text-base text-neutral-700">
            Your payment is still pending, do not close this window...
          </p>
        </div>
      )}

      {paymentStatus.data === "FAILED" && (
        <div className="w-full flex flex-col gap-4 h-full items-center py-24 text-center">
          <XCircleIcon className="text-red-400 w-12 h-12" strokeWidth={1} />
          <p className="text-base text-red-400">
            Your payment failed.
          </p>
        </div>
      )}
    </div>
  );
};

export default Page;
