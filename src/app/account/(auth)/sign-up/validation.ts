import { z } from "zod";

export const SignUpDataSchema = z.object({
  firstName: z.string({
    errorMap: (issue) => {
      switch (issue.code) {
        case "too_small":
          return { message: "This must not be empty" };

        default:
          return { message: issue.message ?? "Invalid value." };
      }
    },
  }).min(1),
  lastName: z.string({
    errorMap: (issue) => {
      switch (issue.code) {
        case "too_small":
          return { message: "This must not be empty" };

        default:
          return { message: issue.message ?? "Invalid value." };
      }
    },
  }).min(1),
  email: z.string().email(),
  phoneNum: z.string().nullish(),
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
          return { message: issue.message ?? "Invalid value" };
      }
    },
  }).min(18).max(104),
});
