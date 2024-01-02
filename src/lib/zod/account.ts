import { z } from "zod";

export const ChangeAccountDetailsSchema = z.object({
  firstName: z.string({
    errorMap: (issue) => {
      switch (issue.code) {
        case "too_small":
          return { message: "This must not be empty." };
        default:
          return { message: issue?.message || "Invalid value." };
      }
    },
  }).min(1),
  lastName: z.string({
    errorMap: (issue) => {
      switch (issue.code) {
        case "too_small":
          return { message: "This must not be empty." };
        default:
          return { message: issue?.message || "Invalid value." };
      }
    },
  }).min(1),
  phoneNum: z.string().nullish(),
  phoneNumCountry: z.string().nullish(),
  age: z.number().min(18),
  billingRegion: z.string().nullish(),
  billingAddress: z.string().nullish(),
  billingCityTown: z.string().nullish(),
  billingPostalCode: z.string().nullish(),
});
