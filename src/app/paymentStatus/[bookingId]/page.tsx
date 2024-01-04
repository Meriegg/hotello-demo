"use client";

import { CheckCircleIcon, Loader2, XCircleIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";

const Page = () => {
  const params = useParams();
  const router = useRouter();

  const paymentStatus = api.checkout.getBookingPaymentStatus.useQuery(
    {
      bookingId: (params?.bookingId as string) ?? "",
    },
    {
      refetchInterval: 500,
      cacheTime: 0,
      onSuccess: (status) => {
        if (status !== "PAID") return;

        Promise.all([
          fetch("/api/removecookie", {
            method: "POST",
            body: JSON.stringify({
              cookieName: "cart",
            }),
          }),
          fetch("/api/removecookie", {
            method: "POST",
            body: JSON.stringify({
              cookieName: "checkout",
            }),
          }),
        ])
          .then(() => {
            router.push(
              "/account/dashboard/bookings",
            );
          })
          .catch((e) => console.error(e));
      },
    },
  );

  if (paymentStatus.error) {
    return (
      <div className="flex h-full w-full flex-col items-center gap-4 py-24 text-center">
        <XCircleIcon className="h-12 w-12 text-red-400" strokeWidth={1} />
        <p className="text-base text-red-400">
          An error happened, please refresh this page.
        </p>
      </div>
    );
  }

  return (
    <div>
      {paymentStatus.data === "PAID" && (
        <div className="flex h-full w-full flex-col items-center gap-4 py-24 text-center">
          <CheckCircleIcon
            className="h-12 w-12 text-green-600"
            strokeWidth={1}
          />
          <p className="text-base text-green-600">
            Your payment was a success, please wait while we redirect you.
          </p>
        </div>
      )}

      {paymentStatus.data === "PENDING" && (
        <div className="flex h-full w-full flex-col items-center gap-4 py-24 text-center">
          <Loader2
            className="h-12 w-12 animate-spin text-neutral-700"
            strokeWidth={1}
          />
          <p className="text-base text-neutral-700">
            Your payment is still pending, do not close this window...
          </p>
        </div>
      )}

      {paymentStatus.data === "FAILED" && (
        <div className="flex h-full w-full flex-col items-center gap-4 py-24 text-center">
          <XCircleIcon className="h-12 w-12 text-red-400" strokeWidth={1} />
          <p className="text-base text-red-400">Your payment failed.</p>
        </div>
      )}
    </div>
  );
};

export default Page;
