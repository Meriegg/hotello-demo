"use client";

import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { getCode as getCountryCode } from "country-list";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { UseFormReturn } from "react-hook-form";
import type { CheckoutFormValidator } from "~/lib/zod/checkout-form";
import { Button } from "~/components/ui/button";
import type { z } from "zod";
import { Loader } from "~/components/ui/loader";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

interface Props {
  clientSecret: string;
  form: UseFormReturn<z.infer<typeof CheckoutFormValidator>>;
  privacyCheck: boolean;
  reservationCheck: boolean;
  existingBookingId: string | null;
}

export const PaymentForm = ({
  clientSecret,
  privacyCheck,
  reservationCheck,
  form,
  existingBookingId,
}: Props) => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [activeLoadingStep, setActiveLoadingStep] = useState<number | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createBooking = api.checkout.createBooking.useMutation();

  const loadingSteps = [
    {
      label: "Creating your order.",
    },
    {
      label: "Confirming your payment.",
    },
  ];

  const completeBooking = async () => {
    if (!privacyCheck || !reservationCheck || !stripe || !elements) return;

    try {
      setIsLoading(true);
      let bookingId: string | null = existingBookingId;

      if (!existingBookingId) {
        setActiveLoadingStep(0);

        const bookingData = await createBooking.mutateAsync({
          ...form.getValues(),
        });

        bookingId = bookingData.mainBooking.id;
      }

      setActiveLoadingStep(1);

      const cardElement = elements.getElement("cardNumber");
      if (!cardElement) {
        setIsError(true);
        setMessage("Could not retrieve card details.");
        return;
      }

      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${form.getValues("step1.firstName")} ${form.getValues(
              "step1.lastName",
            )}`,
            email: form.getValues("step1.email"),
            address: {
              city: form.getValues("step2.cityOrTown"),
              line1: form.getValues("step2.address"),
              country: getCountryCode(form.getValues("step2.countryOrRegion")),
              postal_code: form.getValues("step2.postalCode"),
            },
          },
        },
      });

      if (error) {
        console.error(error);

        switch (error.type) {
          case "card_error":
            setMessage(error?.message ?? "Payment failed.");
            break;
          case "validation_error":
            setMessage(error?.message ?? "Payment failed.");
            break;
          default:
            setMessage("Payment failed.");
            break;
        }

        setIsError(true);
        return;
      }

      setMessage("Redirecting, please wait.");
      setActiveLoadingStep(null);
      setIsLoading(false);

      router.push(`/paymentStatus/${bookingId}`);

      // eslint-disable-next-line
    } catch (error: any) {
      setIsLoading(false);
      setIsError(true);

      // eslint-disable-next-line
      setMessage(`Something went wrong. ${error?.message}`);
    }
  };

  return (
    <div className="mt-4 flex w-full flex-col gap-2">
      <p className="text-sm text-neutral-700">Payment details</p>
      <CardNumberElement
        options={{
          placeholder: "Card number",
          classes: {
            base: "font-serif",
          },
          disabled: isLoading,
        }}
        className="font-serif! w-full border-[1px] border-neutral-100 px-5 py-4 text-sm text-neutral-900 transition-all duration-300"
      />
      <div className="flex items-center gap-2">
        <CardExpiryElement
          options={{ disabled: isLoading }}
          className="font-serif! w-full border-[1px] border-neutral-100 px-5 py-4 text-sm text-neutral-900"
        />
        <CardCvcElement
          options={{ disabled: isLoading }}
          className="font-serif! w-full border-[1px] border-neutral-100 px-5 py-4 text-sm text-neutral-900"
        />
      </div>

      <div className="flex w-full items-center justify-between">
        <img
          src="/powered_by_stripe.svg"
          className="h-auto w-[120px]"
          alt="Powered by stripe"
        />
        <p className="text-italic text-xs font-normal text-neutral-700">
          Your details are secure
        </p>
      </div>

      {createPortal(
        <Button
          onClick={() => completeBooking()}
          disabled={!privacyCheck || !reservationCheck}
          className="mt-2 flex w-full items-center gap-2"
        >
          Complete booking <CheckIcon className="h-4 w-4 text-white" />
        </Button>,
        document.getElementById("COMPLETE_BOOKING_BUTTON_PORTAL") ??
          document.body,
      )}

      {/* eslint-disable-next-line */}
      {(isLoading || message || isError) && (
        <>
          {createPortal(
            <div className="absolute left-0 top-0 z-20 h-full w-full bg-black/80 p-6">
              <div className="flex items-start gap-2">
                {loadingSteps.map((step, i) => (
                  <div key={step.label} className="flex w-full flex-col gap-2">
                    <div
                      className={cn(
                        "h-[4px] w-full rounded-full shadow-sm",
                        activeLoadingStep === i ? "bg-white" : "bg-white/30",
                      )}
                    ></div>
                    <p
                      className={cn(
                        "flex w-full items-center justify-center gap-2 text-center text-sm",
                        activeLoadingStep === i
                          ? "text-white"
                          : "text-white/70",
                      )}
                    >
                      {step.label}{" "}
                      {activeLoadingStep === i && !isError && (
                        <Loader
                          label={null}
                          loaderClassName="p-0 w-fit text-inherit"
                          containerClassName="w-fit p-0"
                          labelClassName="w-fit p-0"
                        />
                      )}
                    </p>
                    {message && activeLoadingStep === i && (
                      <p
                        className={cn(
                          "w-full text-center text-sm font-bold",
                          isError ? "text-red-400" : "text-white/70",
                        )}
                      >
                        {message}{" "}
                        {isError && (
                          <button
                            className="font-normal text-white underline"
                            onClick={() => {
                              setIsLoading(false);
                              setIsError(false);
                              setMessage(null);
                              setActiveLoadingStep(null);
                              form.setValue(
                                "step5.paymentType",
                                form.getValues("step5.paymentType") ===
                                  "RESERVATION_HOLD"
                                  ? "FULL_UPFRONT"
                                  : "RESERVATION_HOLD",
                              );
                            }}
                          >
                            Try again?
                          </button>
                        )}
                      </p>
                    )}
                  </div>
                ))}

                {(activeLoadingStep === null ||
                  activeLoadingStep > loadingSteps.length - 1) &&
                  message && (
                    <p
                      className={cn(
                        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center text-base font-bold",
                        isError ? "text-red-400/70" : "text-white",
                      )}
                    >
                      {message}{" "}
                      {isError && (
                        <button
                          className="font-normal text-white underline"
                          onClick={() => {
                            setIsLoading(false);
                            setIsError(false);
                            setMessage(null);
                            setActiveLoadingStep(null);
                            form.setValue(
                              "step5.paymentType",
                              form.getValues("step5.paymentType") ===
                                "RESERVATION_HOLD"
                                ? "FULL_UPFRONT"
                                : "RESERVATION_HOLD",
                            );
                          }}
                        >
                          Try again?
                        </button>
                      )}
                    </p>
                  )}
              </div>
            </div>,
            document.getElementById("CHECKOUT_FORM_MAIN_CONTAINER") ??
              document.body,
          )}
        </>
      )}
    </div>
  );
};
