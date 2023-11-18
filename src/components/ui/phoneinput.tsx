import "react-phone-input-2/lib/style.css";

import PhoneInput, { type PhoneInputProps } from "react-phone-input-2";

type Props = PhoneInputProps & {
  defaultCountry?: string | null;
};

export const PhoneNumInput = (
  { inputStyle, buttonClass, defaultCountry, ...props }: Props,
) => {
  return (
    <PhoneInput
      {...props}
      inputClass="!w-[100%] !font-serif !border-neutral-100 !rounded-[0px] !text-sm !placeholder:text-neutral-700 !text-neutral-900 !h-[50px]"
      buttonClass="!bg-white !rounded-[0px] !border-neutral-100 !border-r-[0]"
      dropdownClass="!shadow-lg !font-serif !border-neutral-100 !text-sm !top-[40px]"
      country={defaultCountry ?? "us"}
    />
  );
};
