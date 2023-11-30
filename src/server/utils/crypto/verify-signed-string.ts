import { encryptionAlgorithm } from "~/constants";
import { createVerify } from "crypto";

export default (plain: string, signature: string, publicKey: string) => {
  const verifier = createVerify(encryptionAlgorithm);

  verifier.write(plain);
  verifier.end();

  return verifier.verify(publicKey, signature, "hex");
};
