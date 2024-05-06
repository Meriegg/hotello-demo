import { z } from "zod";

export const RoomValidationSchema = z.object({
  name: z
    .string({
      errorMap: (issue) => {
        if (issue.code === "too_small") {
          return { message: "This value is required." };
        }

        return { message: issue?.message ?? "Invalid value." };
      },
    })
    .min(1),
  price: z.number({
    errorMap: (issue) => {
      if (issue.code === "invalid_type") {
        return { message: "This value must be a number." };
      }

      return { message: issue?.message ?? "Invalid value." };
    },
  }),
  accommodates: z.number(),
  hasSpecialNeeds: z.boolean(),
  category: z.string(),
  otherAttributes: z.record(
    z.string(),
    z.string().or(
      z.object({
        href: z.string(),
        text: z.string(),
      }),
    ),
  ),
  images: z
    .string({
      errorMap: (issue) => {
        if (issue.code === "too_small") {
          return { message: "At least 1 image is required." };
        }

        return { message: issue?.message ?? "Invalid value." };
      },
    })
    .array()
    .min(1),
});
