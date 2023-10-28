import { z } from 'zod';

const RangeValidator = z.tuple([z.number(), z.number()])

const PriceRangeValidator = z.object({
  slug: z.string(),
  range: RangeValidator
});


export const FilterDataValidator = z.object({
  priceRanges: PriceRangeValidator.array(),
  categories: z.string().array()
})

export const FilterValidator = z.object({
  selectedPrices: RangeValidator.array(),
  priceRange: RangeValidator.nullish(),
  categories: z.string().array()
})

export type TFilterValidator = z.infer<typeof FilterValidator>
