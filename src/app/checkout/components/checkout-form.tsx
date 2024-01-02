"use client";

import postalCodes from "postal-codes-js";
import { getCode as getCountryCode } from "country-list";
import type { z } from "zod";
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
import { useEffect, useState } from "react";
import { Step3 } from "./checkout-steps/step3/index";
import type { Room } from "@prisma/client";
import { Step4 } from "./checkout-steps/step-4";
import { useToast } from "~/hooks/use-toast";
import Link from "next/link";
import { Step5 } from "./checkout-steps/step5/step-5";

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
  const { toast } = useToast();
  const [debugMode, setDebugMode] = useState(false);
  const [cookieError, setCookieError] = useState(false);
  const [usedDbData, setUsedDbData] = useState(false);
  const [showUseDbData, setShowUseDbData] = useState(false);
  const authSession = api.account.getCurrentSession.useQuery(undefined, {
    onSuccess: () => {
      setShowUseDbData(true);
    },
    retry: 0,
  });

  const debugModeListenerCallback = (event: KeyboardEvent) => {
    if (event.shiftKey && event.key === "I") {
      setDebugMode((prev) => !prev);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", debugModeListenerCallback);

    return () =>
      document.removeEventListener("keydown", debugModeListenerCallback);
  }, []);

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
      step5: {
        paymentType: "FULL_UPFRONT",
      },
    },
  });

  const checkoutSession = api.checkout.getCheckoutSession.useQuery(undefined, {
    onSuccess: (data) => {
      if (data.createdNew) {
        fetch("/api/setcookie", {
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
        })
          .then((res) => {
            if (res.status === 500) {
              toast({
                variant: "destructive",
                title: "An error happened",
                description:
                  "An error happened while trying to persist your session.",
              });

              setCookieError(true);
            }
          })
          .catch((e) => console.error(e));
      }

      if (didLoadData) return;

      const checkoutSesh = data.checkoutSession; // checkout sesssion

      form.setValue("step1", {
        email: checkoutSesh.personaldetails_email ?? "",
        firstName: checkoutSesh.personaldetails_firstName ?? "",
        lastName: checkoutSesh.personaldetails_lastName ?? "",
        phoneNumber: checkoutSesh.personaldetails_phoneNum,
        phoneNumCountry: checkoutSesh.personaldetails_phoneNumCountry,
        age: checkoutSesh.personaldetails_age!,
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

      form.setValue("step5", {
        paymentType: checkoutSesh.paymentType ?? "FULL_UPFRONT",
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
    PERSONAL_DETAILS: {
      step: "step 1",
      stepNum: 0,
      slug: "Personal Details",
      form: <Step1 form={form} />,
      nextBtn: {
        contents: (
          <>
            Billing details <ArrowRight className="h-4 w-4 text-white" />
          </>
        ),
        validateStep: () => {
          const { success } = CheckoutStep1Validator.safeParse(
            form.getValues("step1"),
          );
          form.trigger("step1").catch((e) => console.error(e));

          return success;
        },
      },
    },
    BILLING_DETAILS: {
      step: "step 2",
      stepNum: 1,
      form: <Step2 form={form} />,
      slug: "Billing Details",
      nextBtn: {
        contents: (
          <>
            Booking details <ArrowRight className="h-4 w-4 text-white" />
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

          form.trigger("step2").catch((e) => console.error(e));

          return success;
        },
      },
    },
    BOOKING_DETAILS: {
      step: "step 3",
      stepNum: 2,
      form: <Step3 items={items} form={form} />,
      slug: "Booking Details",
      nextBtn: {
        contents: (
          <>
            Review information <ArrowRight className="h-4 w-4 text-white" />
          </>
        ),
        validateStep: () => {
          const { success } = CheckoutStep3Validator.safeParse(
            form.getValues("step3"),
          );
          form.trigger("step3").catch((e) => console.error(e));

          return success;
        },
      },
    },
    REVIEW_INFORMATION: {
      step: "step 4",
      stepNum: 3,
      slug: "Review information",
      form: (
        <Step4
          form={form}
          items={items}
          checkoutSessionId={checkoutSession.data?.checkoutSession.id ?? ""}
        />
      ),
      nextBtn: {
        contents: (
          <>
            Final payment <ArrowRight className="h-4 w-4 text-white" />
          </>
        ),
        validateStep: () => {
          return true;
        },
      },
    },
    FINAL_PAYMENT: {
      step: "step 5",
      stepNum: 4,
      slug: "Final payment",
      form: (
        <Step5
          existingBookingId={checkoutSession.data?.checkoutSession
            .createdBookingId ?? null}
          form={form}
        />
      ),
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
      className="mx-auto mb-8 flex w-full flex-1 flex-col gap-4 border-[1px] border-neutral-100 p-4 lg:mx-0 lg:max-w-[500px]"
    >
      {cookieError
        ? (
          <>
            <p className="text-center text-lg font-bold text-red-400">Error</p>
            <p className="text-center text-sm text-neutral-700">
              This checkout session will not be persisted, meaning that if you
              refresh this page the data you entered will be lost.{" "}
              <Link
                href="/legal/other/checkout-cookie-error"
                className="text-red-400 hover:underline"
              >
                More info
              </Link>
            </p>
            <p className="text-center text-sm text-neutral-700">
              Please check your internet connection and refresh this page before
              continuing without persistent sessions
            </p>
            <p className="text-center text-sm text-neutral-700">
              Please save this sequence in case you need to contact support:
              {" "}
              <span className="font-bold text-red-400 underline">
                {checkoutSession?.data?.checkoutSession?.id}
              </span>
            </p>
            <button
              onClick={() => setCookieError(false)}
              className="rounded-md bg-neutral-50 px-2 py-2 text-center text-sm text-neutral-900 hover:bg-neutral-100"
            >
              Agree with the terms above and continue
            </button>
          </>
        )
        : (
          <>
            {checkoutSession.isLoading && <Loader label="Fetching data" />}
            {!checkoutSession.isLoading && checkoutSession.data && (
              <StepRenderer
                currentSession={stepNums[
                  checkoutSession.data.checkoutSession.step
                ] ?? null}
                loadingNextStep={nextStepMutation.isLoading}
                nextStep={nextStep}
                form={form}
              />
            )}
            {showUseDbData &&
              checkoutSession.data?.checkoutSession.step ===
                "PERSONAL_DETAILS" &&
              !usedDbData && (
              <div className="flex flex-col gap-2">
                <hr className="w-full border-neutral-100" />
                <p className="text-sm text-neutral-700">
                  Use your current account data? <br />{" "}
                  <span className="text-xs">
                    Your phone number won't be included
                  </span>
                </p>
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <button
                    className="underline"
                    onClick={() => {
                      setShowUseDbData(false);
                      setUsedDbData(true);
                      if (authSession?.data) {
                        form.setValue("step1", {
                          firstName: authSession.data.user.firstName,
                          lastName: authSession.data.user.lastName,
                          email: authSession.data.user.email,
                          age: authSession.data.user.age,
                        });

                        form.setValue("step2", {
                          address: authSession.data.user.billingAddress ?? "",
                          countryOrRegion:
                            authSession.data.user.billingRegion ?? "",
                          cityOrTown: authSession.data.user.billingCityTown ??
                            "",
                          postalCode: authSession.data.user.billingPostalCode ??
                            "",
                        });
                      }
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => {
                      setUsedDbData(true);
                      setShowUseDbData(false);
                    }}
                    className="underline"
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      {debugMode && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-700">Debug data</p>
          <hr className="border-neutral-100" />
          <div className="flex flex-col gap-1">
            <p className="text-sm text-neutral-700">Checkout session id</p>
            <p className="text-base font-bold text-red-400">
              {checkoutSession.data?.checkoutSession.id ?? "-"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-neutral-700">Payment intent id</p>
            <p className="text-base font-bold text-red-400">
              {checkoutSession.data?.checkoutSession.paymentIntentId ?? "-"}
            </p>
          </div>

          <pre className="text-xs text-neutral-700">{JSON.stringify(form.watch(), null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
