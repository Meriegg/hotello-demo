import { env } from "~/env.mjs";
import { encryptionAlgorithm } from "~/constants";
import { createSign } from "crypto";

export default (
  data: string,
  config: { privateKey: string; publicKey: string },
) => {
  const signer = createSign(encryptionAlgorithm);

  signer.write(data);
  signer.end();

  return {
    signature: signer.sign(
      {
        key: config.privateKey,
        passphrase: env.SECRET_KEY,
      },
      "hex",
    ),
    publicKey: config.publicKey,
  };
};
