import { cipherAlgorithm } from "~/constants";
import { generateKeyPairSync } from "crypto";
import { env } from "~/env.mjs";

export default () => {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: cipherAlgorithm,
      passphrase: env.SECRET_KEY,
    },
  });

  return { publicKey, privateKey };
};
