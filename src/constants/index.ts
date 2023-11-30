export const DefaultPriceRanges = [
  {
    slug: "$250 - $400",
    range: [250, 400],
  },
  {
    slug: "$400 - $800",
    range: [400, 800],
  },
  {
    slug: "$800+",
    range: [800, Infinity],
  },
] as { slug: string; range: [number, number] }[];

export const encryptionAlgorithm = "sha256";
export const cipherAlgorithm = "aes-256-cbc";
