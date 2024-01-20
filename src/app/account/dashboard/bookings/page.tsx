"use client;"

import { api } from "~/trpc/server";
import { BookingDisplay } from "./booking-display";
import { useSession } from "~/hooks/use-session";
import { Loader } from "~/components/ui/loader";

const Page = async () => {
  const bookings = await api.account.getUserBookings.query();
  const { data: currentSession, ...currentSessionInfo } = useSession();

  if (currentSessionInfo.isLoading) {
    return <Loader label="Fetching account data" />
  }

  if (currentSessionInfo.isError || !currentSession) {
    return <p className="text-neutral-700 text-xs text-center w-full">You are not logged in.</p>
  }

  return (
    <div className="w-full">
      <p className="text-2xl font-bold text-neutral-900">Your bookings</p>
      <div className="mt-4 flex w-full flex-wrap items-start gap-1">
        {bookings
          .sort((a, b) => b.createdOn.getTime() - a.createdOn.getTime())
          .map((booking) => <BookingDisplay booking={booking} key={booking.id} />)}
      </div>
    </div>
  );
};

export default Page;
