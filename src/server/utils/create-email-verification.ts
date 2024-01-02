import { randomNum } from "~/lib/utils";

export const createEmailVerificationCode = () => {
  const numbers = "123456789".split("").map((c) => parseInt(c));
  const code = [];

  for (let i = 0; i < 6; i++) {
    const randomNumber = randomNum(0, numbers.length - 1);
    const chosenNumber = numbers.at(randomNumber);

    code.push(chosenNumber);
  }

  return {
    codeArray: code,
    codeStr: code.join(""),
  };
};
