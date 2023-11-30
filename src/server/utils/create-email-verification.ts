import { randomNum } from "~/lib/utils";

export const createEmailVerificationCode = () => {
  let numbers = "123456789".split("").map((c) => parseInt(c));
  let code = [];

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
