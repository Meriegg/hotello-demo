"use client";

import postalCodes from "postal-codes-js";
import { getCode as getCountryCode } from "country-list";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Loader } from "~/components/ui/loader";
import { api } from "~/trpc/react";
import {
  CheckoutFormValidator,
  CheckoutStep1Validator,
  CheckoutStep2Validator,
  CheckoutStep3Validator,
} from "~/lib/zod/checkout-form";
import { Step1 } from "./checkout-steps/step-1";
import { ArrowRight } from "lucide-react";
import { StepRenderer } from "./step-renderer";
import { Step2 } from "./checkout-steps/step-2";
import { useState } from "react";
import { Step3 } from "./checkout-steps/step3/index";
import type { Room } from "@prisma/client";
import { Step4 } from "./checkout-steps/step-4";

export type StepType = {
  slug: string;
  stepNum: number;
  step: string;
  form?: JSX.Element;
  nextBtn?: {
    contents: JSX.Element;
    validateStep: () => boolean;
  };
};

interface Props {
  items: Room[];
}

export const Checkoutform = ({ items }: Props) => {
  const [didLoadData, setDidLoadData] = useState(false);
  const [parentRef] = useAutoAnimate();
  const apiUtils = api.useUtils();

  type FormData = z.infer<typeof CheckoutFormValidator>;

  const form = useForm<FormData>({
    resolver: zodResolver(CheckoutFormValidator),
    defaultValues: {
      step1: {
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        phoneNumCountry: "",
        age: undefined,
      },
      step2: {
        countryOrRegion: "",
        address: "",
        cityOrTown: "",
        postalCode: "",
      },
      step3: {
        bookingCheckIn: undefined,
        bookingCheckOut: undefined,
        guestInformation: {},
        allRoomsAvailable: false,
      },
    },
  });

  const checkoutSession = api.checkout.getCheckoutSession.useQuery(undefined, {
    onSuccess: async (data) => {
      if (data.createdNew) {
        await fetch("/api/setcookie", {
          method: "POST",
          body: JSON.stringify({
            key: "checkout",
            value: data.newCheckoutJwt,
            verificationKey: data.cookieVerificationKey,
            args: {
              secure: false,
              httpOnly: true,
              maxAge: 60 * 60 * 24 * 7,
            },
          }),
        });
      }

      if (didLoadData) return;

      const checkoutSesh = data.checkoutSession; // checkout sesssion

      form.setValue("step1", {
        email: checkoutSesh.personaldetails_email ?? "",
        firstName: checkoutSesh.personaldetails_firstName ?? "",
        lastName: checkoutSesh.personaldetails_lastName ?? "",
        phoneNumber: checkoutSesh.personaldetails_phoneNum,
        phoneNumCountry: checkoutSesh.personaldetails_phoneNumCountry,
        age: checkoutSesh.personaldetails_age as number,
      });

      form.setValue("step2", {
        postalCode: checkoutSesh.billingdetails_postalCode ?? "",
        cityOrTown: checkoutSesh.billingdetails_cityOrTown ?? "",
        address: checkoutSesh.billingdetails_address ?? "",
        countryOrRegion: checkoutSesh.billingdetails_countryOrRegion ?? "",
      });

      form.setValue("step3", {
        guestInformation: {},
        bookingCheckOut: checkoutSesh.bookingdetails_checkOut!,
        bookingCheckIn: checkoutSesh.bookingdetails_checkIn!,
        allRoomsAvailable: true,
      });

      type GuestInformationType = z.infer<
        typeof CheckoutStep3Validator
      >["guestInformation"];
      const obj: GuestInformationType = {};
      items.forEach((item) => {
        obj[item.id] = {
          people: {},
        };

        for (let i = 0; i < item.accommodates; i++) {
          const dbData = checkoutSesh.bookingdetails_guestInformation as
            | GuestInformationType
            | null;
          const existingData = !!dbData ? dbData[item.id]?.people[i] : null;

          obj[item.id]!.people[i] = existingData ? { ...existingData } : {
            firstName: "",
            lastName: "",
            age: null,
          };
        }
      });
      form.setValue("step3.guestInformation", obj);

      setDidLoadData(true);
    },
    onSettled: () => {
      apiUtils.cart.invalidate().catch((e) => console.error(e));
    },
    retry: 0,
  });
  const nextStepMutation = api.checkout.nextStep.useMutation({
    onSettled: () => {
      apiUtils.checkout.invalidate().catch((e) => console.error(e));
    },
  });

  const stepNums: Record<string, StepType> = {
    "PERSONAL_DETAILS": {
      step: "step 1",
      stepNum: 0,
      slug: "Personal Details",
      form: <Step1 form={form} />,
      nextBtn: {
        contents: (
          <>
            Billing details <ArrowRight className="w-4 h-4 text-white" />
          </>
        ),
        validateStep: () => {
          const { success } = CheckoutStep1Validator.safeParse(
            form.getValues("step1"),
          );
          form.trigger("step1");

          return success;
        },
      },
    },
    "BILLING_DETAILS": {
      step: "step 2",
      stepNum: 1,
      form: <Step2 form={form} />,
      slug: "Billing Details",
      nextBtn: {
        contents: (
          <>
            Booking details <ArrowRight className="w-4 h-4 text-white" />
          </>
        ),
        validateStep: () => {
          const { success } = CheckoutStep2Validator.safeParse(
            form.getValues("step2"),
          );

          const formValues = form.getValues("step2");
          const countryCode = getCountryCode(formValues.countryOrRegion);

          if (countryCode) {
            const isPostalCodeValid = postalCodes.validate(
              countryCode,
              formValues.postalCode,
            );

            if (typeof isPostalCodeValid === "string") {
              form.setError("step2.postalCode", {
                message: "Invalid postal code.",
              });
              return false;
            }
          }

          form.trigger("step2");

          return success;
        },
      },
    },
    "BOOKING_DETAILS": {
      step: "step 3",
      stepNum: 2,
      form: <Step3 items={items} form={form} />,
      slug: "Booking Details",
      nextBtn: {
        contents: (
          <>
            Review information <ArrowRight className="w-4 h-4 text-white" />
          </>
        ),
        validateStep: () => {
          const { success } = CheckoutStep3Validator.safeParse(
            form.getValues("step3"),
          );
          form.trigger("step3");

          return success;
        },
      },
    },
    "REVIEW_INFORMATION": {
      step: "step 4",
      stepNum: 3,
      slug: "Review information",
      form: <Step4 form={form} items={items} />,
      nextBtn: {
        contents: (
          <>
            Final payment <ArrowRight className="w-4 h-4 text-white" />
          </>
        ),
        validateStep: () => {
          return true;
        },
      },
    },
    "FINAL_PAYMENT": {
      step: "step 5",
      stepNum: 4,
      slug: "Final payment",
    },
  };

  const nextStep = () => {
    // go to next step
    nextStepMutation.mutate({
      sessionId: checkoutSession.data?.checkoutSession.id ?? "",
      formData: form.getValues(),
    });
  };

  return (
    <div
      ref={parentRef}
      className="flex flex-1 max-w-[500px] flex-col gap-4 p-4 border-[1px] border-neutral-100 mb-8"
    >
      {checkoutSession.isLoading && <Loader label="Fetching data" />}
      {!checkoutSession.isLoading && checkoutSession.data && (
        <StepRenderer
          currentSession={stepNums[checkoutSession.data.checkoutSession.step] ??
            null}
          loadingNextStep={nextStepMutation.isLoading}
          nextStep={nextStep}
          form={form}
        />
      )}
    </div>
  );
};
