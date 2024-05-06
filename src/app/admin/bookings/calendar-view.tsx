"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!

import type { Booking as BaseBooking, Room } from "@prisma/client";
import { cn } from "~/lib/utils";

type Booking = BaseBooking & { rooms: { room: Room }[] };

interface Props {
  bookings: Booking[];
}

export const CalendarView = ({ bookings }: Props) => {
  const groupRoomsByDate = () => {
    const groupedBookings: Record<string, Record<string, number>> = {};

    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      if (!booking) continue;

      let existingVal = groupedBookings[booking.bookedCheckIn.toISOString()];
      if (!existingVal) {
        groupedBookings[booking.bookedCheckIn.toISOString()] = {};
        existingVal = groupedBookings[booking.bookedCheckIn.toISOString()];
      }

      for (let j = 0; j < booking.rooms.length; j++) {
        const baseRoom = booking.rooms[j];
        if (!baseRoom) continue;

        const room = baseRoom.room;
        const existingRoomCount = existingVal![room.name];
        if (!existingRoomCount) {
          existingVal![room.name] = 1;
        } else {
          existingVal![room.name] = existingRoomCount + 1;
        }
      }
    }

    return groupedBookings;
  };

  return (
    <div>
      <div
        className="flex h-[35px] items-center justify-center rounded-lg bg-red-400 text-center text-sm text-white"
        style={{ width: "min(250px, 100%)" }}
      >
        Customer not checked in
      </div>
      <div
        className="mb-2 mt-2 flex h-[35px] items-center justify-center rounded-lg bg-neutral-50 text-center text-sm text-neutral-900"
        style={{ width: "min(250px, 100%)" }}
      >
        Customer checked in
      </div>
      <div
        className="mb-4 flex h-[35px] items-center justify-center rounded-lg bg-black text-center text-sm text-white"
        style={{ width: "min(250px, 100%)" }}
      >
        Customer missed booking
      </div>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        displayEventTime={false}
        events={[
          ...bookings.map((booking) => ({
            title: `${booking.personalDetailsFirstName} ${booking.personalDetailsLastName}`,
            start: booking.bookedCheckIn,
            end: booking.bookedCheckOut,
            className: cn(
              "px-2",
              booking.customerCheckIn
                ? "bg-neutral-50"
                : "bg-red-400 text-white",
              booking.fulfillmentStatus === "MISSED" && "!bg-black",
            ),
            borderColor: "transparent",
            textColor: booking.customerCheckIn
              ? "hsl(var(--neutral-900))"
              : "white",
            url: `/admin/bookings/${booking.id}`,
          })),
          ...Object.keys(groupRoomsByDate())
            .map((key) => {
              const dateFromKey = new Date(key);
              const val = groupRoomsByDate()[key];
              const valKeys = Object.keys(val!);

              return valKeys.map((roomName) => ({
                date: dateFromKey,
                title: `x${val![roomName]} ${roomName}`,
                extendedProps: {
                  title: `x${val![roomName]} ${roomName}`,
                },
              }));
            })
            .flat(1),
        ]}
      />
    </div>
  );
};
