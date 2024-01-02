import type { Room } from "@prisma/client";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { CheckoutFormValidator } from "~/lib/zod/checkout-form";
import { calculateStayDuration } from "~/server/utils/calculate-stay-duration";
import { api } from "~/trpc/react";

interface Props {
  form: UseFormReturn<z.infer<typeof CheckoutFormValidator>>;
  items: Room[];
  checkoutSessionId: string;
}

const InfoDisplay = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => {
  return (
    <div className="flex flex-col items-start justify-start gap-1">
      <p className="text-xs text-red-400">{label}</p>
      <p className="text-sm font-bold text-neutral-900">{value ?? "-"}</p>
    </div>
  );
};

export const Step4 = ({ form, items, checkoutSessionId }: Props) => {
  const formValues = form.getValues();
  const apiUtils = api.useUtils();
  const goToStep = api.checkout.goToStep.useMutation({
    onSuccess: () => {
      apiUtils.checkout.invalidate().catch((e) => console.error(e));
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex w-full items-center justify-between text-xs">
          <p className="text-neutral-700">Your personal information</p>
          <button
            onClick={() =>
              goToStep.mutate({
                step: "PERSONAL_DETAILS",
                sessionId: checkoutSessionId,
              })
            }
            disabled={goToStep.isLoading}
            className="italic text-red-400 underline disabled:cursor-not-allowed disabled:opacity-70"
          >
            Go to step 1
          </button>
        </div>
        <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
          <InfoDisplay
            label="Full name"
            value={`${formValues.step1.firstName} ${formValues.step1.lastName}`}
          />
          <InfoDisplay label="Age" value={formValues.step1.age?.toString()} />
          <InfoDisplay
            label="Phone number"
            value={
              formValues.step1.phoneNumber
                ? `(${formValues.step1.phoneNumCountry}) ${formValues.step1.phoneNumber}`
                : null
            }
          />
          <InfoDisplay label="Email" value={formValues.step1.email} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex w-full items-center justify-between text-xs">
          <p className="text-neutral-700">Billing information</p>
          <button
            onClick={() =>
              goToStep.mutate({
                step: "BILLING_DETAILS",
                sessionId: checkoutSessionId,
              })
            }
            disabled={goToStep.isLoading}
            className="italic text-red-400 underline disabled:cursor-not-allowed disabled:opacity-70"
          >
            Go to step 2
          </button>
        </div>
        <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
          <InfoDisplay
            label="Country/Region"
            value={formValues.step2.countryOrRegion}
          />
          <InfoDisplay label="City/Town" value={formValues.step2.cityOrTown} />
          <InfoDisplay
            label="Postal code"
            value={formValues.step2.postalCode}
          />
          <InfoDisplay label="Address" value={formValues.step2.address} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex w-full items-center justify-between text-xs">
          <p className="text-neutral-700">Booking details</p>
          <button
            onClick={() =>
              goToStep.mutate({
                step: "BOOKING_DETAILS",
                sessionId: checkoutSessionId,
              })
            }
            disabled={goToStep.isLoading}
            className="italic text-red-400 underline disabled:cursor-not-allowed disabled:opacity-70"
          >
            Go to step 3
          </button>
        </div>
        <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
          <InfoDisplay
            label="Check in"
            value={new Intl.DateTimeFormat().format(
              formValues.step3.bookingCheckIn,
            )}
          />
          <InfoDisplay
            label="Check out"
            value={new Intl.DateTimeFormat().format(
              formValues.step3.bookingCheckOut,
            )}
          />
          <InfoDisplay
            label="Total days"
            value={(() => {
              if (
                !formValues.step3.bookingCheckIn ||
                !formValues.step3.bookingCheckOut
              ) {
                return "N/A" as const;
              }

              const stayInDays = calculateStayDuration(
                formValues.step3.bookingCheckIn,
                formValues.step3.bookingCheckOut,
              );

              return `${stayInDays} ${
                stayInDays > 1 ? "Days" : "Day"
              }` as const;
            })()}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs text-neutral-700">Room details</p>
        <div className="-mt-4 flex w-full flex-col divide-y divide-neutral-100">
          {Object.keys(formValues.step3.guestInformation).map((key, i) => {
            const roomValues = items.find((item) => item.id === key);
            const values = formValues.step3.guestInformation[key];
            const peopleArray = Object.keys(values?.people ?? {}).map(
              (key) => values?.people[key] ?? null,
            );

            if (!roomValues) return null;

            return (
              <div key={i} className="flex w-full flex-col gap-4 py-4">
                <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="max-w-[300px] text-sm font-bold text-neutral-900">
                      {roomValues.name}
                    </p>
                    <p className="text-xs text-red-400">
                      {roomValues.accommodates}{" "}
                      {roomValues.accommodates > 1 ? "people" : "person"}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-red-400">
                    ${roomValues.price / 100}
                    <span className="text-xs text-neutral-700">/night</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                  {peopleArray.map((data, i) => (
                    <div key={i} className="item-start flex gap-2">
                      <p className="text-xs italic text-neutral-700">
                        #{i + 1}
                      </p>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-neutral-900">
                          {data?.firstName ?? "-"}{" "}
                          {data?.lastName ?? (!data?.firstName ? "" : "-")}
                        </p>
                        <p className="text-xs text-neutral-900">
                          Age: {data?.age ?? "(No age)"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
