import { z } from "zod";

export const CheckoutStep1Validator = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullish(),
  phoneNumCountry: z.string().nullish(),
  age: z.number({
    errorMap: (issue) => {
      switch (issue.code) {
        case "invalid_type":
          return { message: "This should be a number." };

        case "too_small":
          return { message: "You must be at least 18 years old" };

        case "too_big":
          return { message: "Really?" };

        default:
          return { message: "Invalid value" };
      }
    },
  }).min(18).max(104),
});

export const CheckoutStep2Validator = z.object({
  countryOrRegion: z.string().min(1),
  address: z.string().min(1),
  cityOrTown: z.string().min(1),
  postalCode: z.string().min(1),
});

export const CheckoutStep3Validator = z.object({
  bookingCheckIn: z.date(),
  bookingCheckOut: z.date(),
  guestInformation: z.record(
    z.string(),
    z.object({
      people: z.record(
        z.string().or(z.number()),
        z.object({
          firstName: z.string(),
          lastName: z.string(),
          age: z.number().nullish(),
        }),
      ),
    }),
  ),
  allRoomsAvailable: z.boolean().refine((val) => val === true),
});

export const CheckoutFormValidator = z.object({
  step1: CheckoutStep1Validator,
  step2: CheckoutStep2Validator,
  step3: CheckoutStep3Validator,
});
