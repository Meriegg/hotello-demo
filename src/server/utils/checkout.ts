import type { CheckoutStep } from "@prisma/client";
import {
  CheckoutStep1Validator,
  CheckoutStep2Validator,
  CheckoutStep3Validator,
} from "~/lib/zod/checkout-form";

export const getStepStrData = (step: CheckoutStep) => {
  switch (step) {
    case "PERSONAL_DETAILS":
      return { num: 1, slug: "step1", validator: CheckoutStep1Validator };
    case "BILLING_DETAILS":
      return { num: 2, slug: "step2", validator: CheckoutStep2Validator };
    case "BOOKING_DETAILS":
      return { num: 3, slug: "step3", validator: CheckoutStep3Validator };
    case "REVIEW_INFORMATION":
      return { num: 4, slug: "step4" };
    case "FINAL_PAYMENT":
      return { num: 5, slug: "step5" };
    default:
      return null;
  }
};

export const StepsInOrderArray = [
  "PERSONAL_DETAILS",
  "BILLING_DETAILS",
  "BOOKING_DETAILS",
  "REVIEW_INFORMATION",
  "FINAL_PAYMENT",
] as const;
