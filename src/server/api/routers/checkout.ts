import { stripe } from "~/lib/stripe";
import { cookies } from "next/headers";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { extractFromCartJwt } from "~/server/utils/cart-jwt";
import { TRPCError } from "@trpc/server";
import {
  createCheckoutJwt,
  verifyCheckoutJwt,
} from "~/server/utils/checkout-jwt";
import { createCookieVerification } from "~/server/utils/cookies";
import { z } from "zod";
import {
  CheckoutFormValidator,
  CheckoutStep1Validator,
  CheckoutStep2Validator,
  CheckoutStep3Validator,
  CheckoutStep5Validator,
} from "~/lib/zod/checkout-form";
import { getStepStrData, StepsInOrderArray } from "~/server/utils/checkout";
import { calculateStayDuration } from "~/server/utils/calculate-stay-duration";
import { calculatePrices } from "~/server/utils/calculate-prices";

const createNewPaymentIntent = async (amount: number) => {
  return await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });
};

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
  configurePaymentForm: publicProcedure.input(CheckoutStep5Validator).query(
    async ({ ctx: { db }, input: { paymentType } }) => {
      const cookieStore = cookies();
      const cartToken = cookieStore.get("cart")?.value;
      if (!cartToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You do not have any items in your cart.",
        });
      }

      const checkoutSessionToken = cookieStore.get("checkout")?.value;
      const checkoutSessionId = verifyCheckoutJwt(checkoutSessionToken ?? "");
      const checkoutSession = await db.checkoutSession.findUnique({
        where: { id: checkoutSessionId ?? "" },
      });

      const cartItems = extractFromCartJwt(cartToken);
      if (!cartItems?.length) {
        await db.checkoutSession.update({
          where: {
            id: checkoutSession?.id ?? "",
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

      const dbItems = await db.room.findMany({
        where: {
          id: {
            in: cartItems,
          },
        },
      });

      if (
        !checkoutSession?.bookingdetails_checkIn ||
        !checkoutSession.bookingdetails_checkOut
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid form details",
        });
      }

      const calculatedStayInDays = calculateStayDuration(
        checkoutSession.bookingdetails_checkIn,
        checkoutSession.bookingdetails_checkOut,
      );
      const { cartTotal, reservationHold } = calculatePrices(
        dbItems,
        calculatedStayInDays,
      );

      const amountDue = paymentType === "FULL_UPFRONT"
        ? cartTotal.stripe
        : reservationHold.stripe;

      if (!checkoutSession.paymentIntentId) {
        const newPaymentIntent = await createNewPaymentIntent(amountDue);

        await db.checkoutSession.update({
          where: {
            id: checkoutSession.id,
          },
          data: {
            paymentIntentId: newPaymentIntent.id,
            paymentType,
          },
        });

        if (checkoutSession.createdBookingId) {
          await db.booking.update({
            where: {
              id: checkoutSession.createdBookingId,
            },
            data: {
              paymentIntentId: newPaymentIntent.id,
              paymentType,
            },
          });
        }

        return {
          totalUpfront: {
            stripe: cartTotal.stripe,
            display: cartTotal.display,
          },
          reservationHold: {
            stripe: reservationHold.stripe,
            display: reservationHold.display,
          },
          clientSecret: newPaymentIntent.client_secret,
          paymentIntentId: newPaymentIntent.id,
        };
      }

      await db.checkoutSession.update({
        where: {
          id: checkoutSession.id,
        },
        data: {
          paymentType,
        },
      });

      try {
        const updatedPaymentIntent = await stripe.paymentIntents.update(
          checkoutSession.paymentIntentId,
          {
            amount: amountDue,
          },
        );

        return {
          totalUpfront: {
            stripe: cartTotal.stripe,
            display: cartTotal.display,
          },
          reservationHold: {
            stripe: reservationHold.stripe,
            display: reservationHold.display,
          },
          clientSecret: updatedPaymentIntent.client_secret,
          paymentIntentId: updatedPaymentIntent.id,
        };
      } catch (error) {
        const newPaymentIntent = await createNewPaymentIntent(amountDue);

        await db.checkoutSession.update({
          where: {
            id: checkoutSession.id,
          },
          data: {
            paymentIntentId: newPaymentIntent.id,
            paymentType,
          },
        });

        if (checkoutSession.createdBookingId) {
          await db.booking.update({
            where: {
              id: checkoutSession.createdBookingId,
            },
            data: {
              paymentIntentId: newPaymentIntent.id,
              paymentType,
            },
          });
        }

        return {
          totalUpfront: {
            stripe: cartTotal.stripe,
            display: cartTotal.display,
          },
          reservationHold: {
            stripe: reservationHold.stripe,
            display: reservationHold.display,
          },
          clientSecret: newPaymentIntent.client_secret,
          paymentIntentId: newPaymentIntent.id,
        };
      }
    },
  ),
  createBooking: privateProcedure.input(
    CheckoutFormValidator,
  ).mutation(
    async ({ ctx: { db, userSession }, input }) => {
      const cookieStore = cookies();
      const cartToken = cookieStore.get("cart")?.value;
      if (!cartToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You do not have any items in your cart.",
        });
      }

      const checkoutSessionToken = cookieStore.get("checkout")?.value;
      const checkoutSessionId = verifyCheckoutJwt(checkoutSessionToken ?? "");
      const checkoutSession = await db.checkoutSession.findUnique({
        where: { id: checkoutSessionId ?? "" },
      });
      if (!checkoutSession?.paymentIntentId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No paymentIntentId is present on the checkout session.",
        });
      }

      const cartItems = extractFromCartJwt(cartToken);
      if (!cartItems?.length) {
        await db.checkoutSession.update({
          where: {
            id: checkoutSession?.id ?? "",
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

      const dbItems = await db.room.findMany({
        where: {
          id: {
            in: cartItems,
          },
        },
      });

      if (
        !checkoutSession?.bookingdetails_checkIn ||
        !checkoutSession.bookingdetails_checkOut
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid form details",
        });
      }

      const calculatedStayInDays = calculateStayDuration(
        checkoutSession.bookingdetails_checkIn,
        checkoutSession.bookingdetails_checkOut,
      );

      const { baseRoomsPrice, reservationHold, cartTotal } = calculatePrices(
        dbItems,
        calculatedStayInDays,
      );

      const priceToPayOnCheckIn = input.step5.paymentType === "FULL_UPFRONT"
        ? 0
        : cartTotal.stripe - reservationHold.stripe;

      // Check if prices match
      const paymentIntent = await stripe.paymentIntents.retrieve(
        checkoutSession.paymentIntentId,
      );

      const amountToPay = checkoutSession.paymentType === "FULL_UPFRONT"
        ? cartTotal.stripe
        : reservationHold.stripe;
      console.log(checkoutSession.paymentType);
      console.log(amountToPay);
      console.log(paymentIntent.amount);

      if (paymentIntent.amount !== amountToPay) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart amount mismatch, please refresh this page.",
        });
      }

      // Create the main booking
      const mainBooking = await db.booking.create({
        data: {
          baseRoomsPrice,
          calculatedStayInDays,
          paymentType: input.step5.paymentType,
          bookedCheckIn: input.step3.bookingCheckIn,
          bookedCheckOut: input.step3.bookingCheckOut,
          paymentStatus: "PENDING",
          paymentIntentId: checkoutSession.paymentIntentId,
          reservationHoldPrice: reservationHold.stripe,
          priceToPayOnCheckIn,
          userId: userSession.userId,
          checkoutSessionId: checkoutSession.id,
          billingRoomsDataCopy: JSON.stringify(dbItems),
          billingUserDetailsCopy: JSON.stringify(userSession.user),
        },
      });

      await db.checkoutSession.update({
        where: {
          id: checkoutSession.id,
        },
        data: {
          createdBookingId: mainBooking.id,
        },
      });

      // Create bookings for rooms
      await db.bookingRoom.createMany({
        data: dbItems.map((item) => ({
          roomId: item.id,
          bookingId: mainBooking.id,
          calculatedStayInDays,
          billingRoomCopy: JSON.stringify(item),
          finalPriceForRoom:
            calculatePrices([item], calculatedStayInDays).cartTotal.stripe,
        })),
      });

      const allRoomBookings = await db.bookingRoom.findMany({
        where: {
          bookingId: mainBooking.id,
        },
      });

      const guests: {
        age: number;
        firstName: string;
        lastName: string;
        roomId: string;
      }[] = [];

      const roomKeys: string[] = Object.keys(input.step3.guestInformation);
      for (const roomKey of roomKeys) {
        const roomData = input.step3.guestInformation[roomKey];
        if (!roomData) continue;

        const peopleKeys = Object.keys(roomData.people);

        for (const personKey of peopleKeys) {
          const personDetails = roomData.people[personKey];
          if (!personDetails) continue;

          if (
            Object.values(personDetails).every((field) =>
              !field || field === null || field === undefined
            )
          ) {
            continue;
          }

          const roomBookingId = allRoomBookings.find((room) =>
            room.roomId === roomKey
          )?.id;
          if (!roomBookingId) continue;

          guests.push({
            firstName: personDetails.firstName,
            lastName: personDetails.lastName,
            age: personDetails.age ?? 0,
            roomId: roomBookingId,
          });
        }
      }

      if (guests.length > 0) {
        await db.bookingRoomGuestDetails.createMany({
          data: guests.map(({ firstName, lastName, age, roomId }) => {
            return {
              firstName,
              lastName,
              age,
              bookingRoomId: roomId,
              bookingUserId: userSession.userId,
            };
          }),
        });
      }

      return {
        success: true,
        mainBooking,
      };
    },
  ),
  getBookingPaymentStatus: publicProcedure.input(
    z.object({ bookingId: z.string() }),
  ).query(async ({ input: { bookingId }, ctx: { db } }) => {
    const booking = await db.booking.findUnique({
      where: {
        id: bookingId,
      },
    });
    if (!booking) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "This booking does not exist.",
      });
    }

    return booking.paymentStatus;
  }),
});
