import { z } from "zod";
import { PhoneNumInput } from "~/components/ui/phoneinput";
import { Input } from "~/components/ui/input";
import { CheckoutFormValidator } from "~/lib/zod/checkout-form";
import { type UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<z.infer<typeof CheckoutFormValidator>>;
}

export const Step1 = ({ form }: Props) => {
  const { errors: { step1 } } = form.formState;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          {...form.register("step1.firstName")}
          containerClassName="w-full"
          className="rounded-tl-[15px]"
          error={step1?.firstName?.message}
          label="First name"
        />
        <Input
          containerClassName="w-full"
          className="rounded-tr-[15px]"
          {...form.register("step1.lastName")}
          error={step1?.lastName?.message}
          label="Last name"
        />
      </div>
      <Input
        {...form.register("step1.email")}
        error={step1?.email?.message}
        label="Email"
      />
      <PhoneNumInput
        onChange={(value, country) => {
          form.setValue("step1.phoneNumber", value);
          form.setValue(
            "step1.phoneNumCountry",
            (country as any)?.countryCode ?? "",
          );
        }}
        inputClass="!rounded-[5px]"
        buttonClass="!rounded-[5px]"
        defaultCountry={form.watch("step1.phoneNumCountry")}
        value={form.watch("step1.phoneNumber")}
        placeholder="Phone number (optional)"
      />
      <Input
        type="number"
        {...form.register("step1.age", {
          valueAsNumber: true,
        })}
        className="rounded-b-[15px]"
        error={step1?.age?.message}
        label="Age"
        pattern="[0-9]"
      />
    </div>
  );
};
