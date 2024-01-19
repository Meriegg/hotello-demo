import { getNames } from "country-list";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { CheckoutFormValidator } from "~/lib/zod/checkout-form";

interface Props {
  form: UseFormReturn<z.infer<typeof CheckoutFormValidator>>;
}

export const Step2 = ({ form }: Props) => {
  const {
    errors: { step2 },
  } = form.formState;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-neutral-700">
        Details must belong to the person creating this booking!
      </p>
      <Select
        value={form.watch("step2.countryOrRegion")}
        onValueChange={(val) => form.setValue("step2.countryOrRegion", val)}
      >
        <SelectTrigger className="rounded-t-[15px]">
          <SelectValue placeholder="Country or Region" />
        </SelectTrigger>
        <SelectContent>
          {getNames().map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        {...form.register("step2.address")}
        error={step2?.address?.message}
        label="Address"
      />
      <Input
        {...form.register("step2.cityOrTown")}
        error={step2?.cityOrTown?.message}
        label="City or town"
      />
      <Input
        {...form.register("step2.postalCode")}
        error={step2?.postalCode?.message}
        label="Postal code"
        className="rounded-b-[15px]"
      />
    </div>
  );
};
