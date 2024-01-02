export const DefaultPriceRanges = [
  {
    slug: "$250 - $400",
    range: [250 * 100, 400 * 100],
  },
  {
    slug: "$400 - $800",
    range: [400 * 100, 800 * 100],
  },
  {
    slug: "$800+",
    range: [800 * 100, Infinity],
  },
] as { slug: string; range: [number, number] }[];

export const encryptionAlgorithm = "sha256";
export const cipherAlgorithm = "aes-256-cbc";
