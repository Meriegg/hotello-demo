"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Loader } from "~/components/ui/loader";
import { Elements } from "@stripe/react-stripe-js";
import { env } from "~/env.mjs";
import { api } from "~/trpc/react";
import type { UseFormReturn } from "react-hook-form";
import type { CheckoutFormValidator } from "~/lib/zod/checkout-form";
import type { z } from "zod";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { HelpCircleIcon } from "lucide-react";
import { PaymentForm } from "./payment-form";
import Link from "next/link";
import { Checkbox } from "~/components/ui/checkbox";
import { useState } from "react";

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

type FormData = z.infer<typeof CheckoutFormValidator>;

interface Props {
  form: UseFormReturn<FormData>;
  existingBookingId: string | null;
}

export const Step5 = ({ form, existingBookingId }: Props) => {
  const [privacyCheck, setPrivacyCheck] = useState(false);
  const [reservationCheck, setReservationCheck] = useState(false);

  const userSession = api.account.getCurrentSession.useQuery(undefined, {
    retry: 0,
  });

  const paymentFormData = api.checkout.configurePaymentForm.useQuery(
    {
      paymentType: form.watch("step5.paymentType"),
    },
    {
      cacheTime: 0,
    },
  );

  if (userSession.isLoading) {
    return <Loader label="Fetching account data" />;
  }

  if (userSession.isError) {
    return (
      <div className="text-center">
        <p className="text-2xl font-bold text-neutral-900">Oops</p>
        <p className="mt-2 text-sm text-neutral-700">
          Please{" "}
          <Link
            href="/account/login?redirect=/checkout"
            className="text-red-400 hover:underline"
          >
            sign in
          </Link>{" "}
          or{" "}
          <Link
            href="/account/sign-up?redirect=/checkout"
            className="mt-2 text-red-400 hover:underline"
          >
            create an account
          </Link>{" "}
          in order to complete the final step.
        </p>
      </div>
    );
  }

  if (paymentFormData.isLoading) {
    return <Loader label="Fetching payment data" />;
  }

  if (paymentFormData.isError) {
    return (
      <div>
        <p>An error happened</p>
        {paymentFormData.error?.message && (
          <p>{paymentFormData.error?.message}</p>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div>
        <p className="text-italic text-sm font-normal text-neutral-700">
          Amount due now
        </p>
        {form.watch("step5.paymentType") === "FULL_UPFRONT" ? (
          <p className="text-lg font-bold text-red-400">
            ${paymentFormData.data.totalUpfront.display.toFixed(2)}{" "}
            <span className="text-italic text-xs font-normal tracking-normal">
              Fully refundable
            </span>
          </p>
        ) : (
          <p className="text-lg font-bold text-red-400">
            ${paymentFormData.data.reservationHold.display.toFixed(2)}{" "}
            <span className="text-italic text-xs font-normal tracking-normal">
              non-refundable reservation hold{" "}
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircleIcon className="ml-1 h-3 w-3 text-neutral-700" />
                </TooltipTrigger>
                <TooltipContent>
                  This amount will be deducted from your total.
                </TooltipContent>
              </Tooltip>
            </span>
          </p>
        )}

        <RadioGroup
          onValueChange={(val) => {
            form.setValue(
              "step5.paymentType",
              val as FormData["step5"]["paymentType"],
            );
          }}
          className="justiy-evenly mt-4 flex w-full items-start"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <RadioGroupItem
                value={"FULL_UPFRONT" as FormData["step5"]["paymentType"]}
                checked={form.watch("step5.paymentType") === "FULL_UPFRONT"}
                id="rd1"
              />
              <Label htmlFor="rd1">Full amount Upfront</Label>
            </div>

            <p className="text-italic font-regular text-sm text-neutral-700">
              Note: Full amount is refundable
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <RadioGroupItem
                value={"RESERVATION_HOLD" as FormData["step5"]["paymentType"]}
                checked={form.watch("step5.paymentType") === "RESERVATION_HOLD"}
                id="rd2"
              />
              <Label htmlFor="rd1" className="text-neutral-900">
                Reservation hold
              </Label>
            </div>
            <p className="text-italic font-regular text-sm text-neutral-700">
              Note: Reservation hold is{" "}
              <span className="text-red-400">non-refundable</span>
            </p>
          </div>
        </RadioGroup>

        {paymentFormData.data?.clientSecret && (
          <Elements
            options={{
              clientSecret: paymentFormData.data.clientSecret,
            }}
            stripe={stripePromise}
          >
            <PaymentForm
              existingBookingId={existingBookingId}
              privacyCheck={privacyCheck}
              reservationCheck={reservationCheck}
              form={form}
              clientSecret={paymentFormData.data.clientSecret}
            />
          </Elements>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-neutral-700">Other</p>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={privacyCheck}
            onCheckedChange={(val) => setPrivacyCheck(val as boolean)}
            id="CHECKBOX_TERMS"
          />
          <Label htmlFor="CHECKBOX_TERMS" className="text-neutral-900">
            I agree with the{" "}
            <Link href="/legal/privacy" className="text-red-400 underline">
              Privacy policy
            </Link>
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={reservationCheck}
            onCheckedChange={(val) => setReservationCheck(val as boolean)}
            id="CHECKBOX_TERMS"
          />
          <Label htmlFor="CHECKBOX_TERMS" className="text-neutral-900">
            I agree with the{" "}
            <Link
              href="/legal/reservationPaymentHold"
              className="text-red-400 underline"
            >
              Reservation Payment Policy
            </Link>
          </Label>
        </div>
      </div>

      <div className="w-full" id="COMPLETE_BOOKING_BUTTON_PORTAL"></div>
      <div className="w-full" id="LOADING_OVERLAY_PORTAL"></div>
    </TooltipProvider>
  );
};
