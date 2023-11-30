import { cookies } from "next/headers";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { extractFromCartJwt } from "~/server/utils/cart-jwt";
import { TRPCError } from "@trpc/server";
import {
  createCheckoutJwt,
  verifyCheckoutJwt,
} from "~/server/utils/checkout-jwt";
import { createCookieVerification } from "~/server/utils/cookies";
import { z } from "zod";
import {
  CheckoutStep1Validator,
  CheckoutStep2Validator,
  CheckoutStep3Validator,
} from "~/lib/zod/checkout-form";
import { getStepStrData, StepsInOrderArray } from "~/server/utils/checkout";

export const checkoutRouter = createTRPCRouter({
  getCheckoutSession: publicProcedure.query(async ({ ctx: { db } }) => {
    const cookieStore = cookies();
    const cookieVerificationKey = createCookieVerification("checkout");
    const cartToken = cookieStore.get("cart")?.value;
    if (!cartToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You do not have any items in your cart.",
      });
    }

    const checkoutSessionToken = cookieStore.get("checkout")?.value;
    const checkoutSessionId = verifyCheckoutJwt(checkoutSessionToken ?? "");
    const session = await db.checkoutSession.findUnique({
      where: { id: checkoutSessionId ?? "" },
    });

    const cartItems = extractFromCartJwt(cartToken);
    if (!cartItems?.length) {
      await db.checkoutSession.update({
        where: {
          id: session?.id ?? "",
        },
        data: {
          productIds: [],
          productJsonCopy: {},
        },
      });

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You do not have any items in your cart.",
      });
    }

    if (checkoutSessionId && session) {
      if (session.productIds.length !== cartItems.length) {
        const dbProducts = await db.room.findMany({
          where: { id: { in: cartItems } },
        });

        await db.checkoutSession.update({
          where: {
            id: session.id,
          },
          data: {
            productIds: cartItems,
            productJsonCopy: dbProducts,
          },
        });
      }

      return {
        createdNew: false,
        checkoutSession: session,
        newCheckoutJwt: null,
        cookieVerificationKey,
      };
    }

    const dbProducts = await db.room.findMany({
      where: { id: { in: cartItems } },
    });

    const newSession = await db.checkoutSession.create({
      data: {
        step: "PERSONAL_DETAILS",
        productIds: cartItems,
        productJsonCopy: dbProducts,
      },
    });

    const newCheckoutJwt = createCheckoutJwt(newSession.id);

    return {
      checkoutSession: newSession,
      createdNew: true,
      newCheckoutJwt,
      cookieVerificationKey,
    };
  }),
  nextStep: publicProcedure.input(
    z.object({
      sessionId: z.string(),
      formData: z.record(z.string(), z.any()),
    }),
  ).mutation(
    async ({ ctx: { db }, input: { sessionId, formData } }) => {
      const checkoutSession = await db.checkoutSession.findUnique({
        where: { id: sessionId },
      });
      if (!checkoutSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This checkout session does not exist.",
        });
      }

      if (checkoutSession.step === "FINAL_PAYMENT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are at the last step.",
        });
      }

      const stepData = getStepStrData(checkoutSession.step);
      if (!stepData?.slug) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid step.",
        });
      }

      const formDataKey: string = stepData.slug;
      const bodyData = stepData?.validator
        ? stepData.validator.parse(formData[formDataKey])
        : null;

      const nextStep = StepsInOrderArray.at(stepData.num);
      if (!nextStep) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      let updateStepData = {};

      switch (stepData.slug) {
        case "step1":
          const step1Data = bodyData as z.infer<typeof CheckoutStep1Validator>;

          updateStepData = {
            personaldetails_firstName: step1Data.firstName,
            personaldetails_lastName: step1Data.lastName,
            personaldetails_email: step1Data.email,
            personaldetails_phoneNum: step1Data.phoneNumber,
            personaldetails_phoneNumCountry: step1Data.phoneNumCountry,
            personaldetails_age: step1Data.age,
          };
          break;

        case "step2":
          const step2Data = bodyData as z.infer<typeof CheckoutStep2Validator>;

          updateStepData = {
            billingdetails_countryOrRegion: step2Data.countryOrRegion,
            billingdetails_address: step2Data.address,
            billingdetails_cityOrTown: step2Data.cityOrTown,
            billingdetails_postalCode: step2Data.postalCode,
          };
          break;

        case "step3":
          const step3Data = bodyData as z.infer<typeof CheckoutStep3Validator>;

          updateStepData = {
            bookingdetails_checkIn: step3Data.bookingCheckIn,
            bookingdetails_checkOut: step3Data.bookingCheckOut,
            bookingdetails_guestInformation: step3Data.guestInformation,
          };
          break;
      }

      const updatedSession = await db.checkoutSession.update({
        where: {
          id: checkoutSession.id,
        },
        data: {
          ...updateStepData,
          step: nextStep,
        },
      });

      return {
        updatedSession,
      };
    },
  ),
  goToStep: publicProcedure.input(
    z.object({
      sessionId: z.string(),
      step: z.enum(
        [
          "FINAL_PAYMENT",
          "BILLING_DETAILS",
          "BOOKING_DETAILS",
          "PERSONAL_DETAILS",
          "REVIEW_INFORMATION",
        ],
      ),
    }),
  ).mutation(async ({ ctx: { db }, input: { sessionId, step } }) => {
    return await db.checkoutSession.update({
      where: {
        id: sessionId,
      },
      data: {
        step,
      },
    });
  }),
});
