import "react-phone-input-2/lib/style.css";

import PhoneInput, { type PhoneInputProps } from "react-phone-input-2";
import { cn } from "~/lib/utils";

type Props = PhoneInputProps & {
  defaultCountry?: string | null;
  error?: string | null;
};

export const PhoneNumInput = ({
  buttonClass,
  defaultCountry,
  inputClass,
  error,
  ...props
}: Props) => {
  return (
    <div className="flex w-full flex-col gap-1">
      <PhoneInput
        {...props}
        inputClass={cn(
          "!w-[100%] !font-serif !border-neutral-100 !rounded-[0px] !text-sm !placeholder:text-neutral-700 !text-neutral-900 !h-[50px]",
          inputClass,
        )}
        buttonClass={cn(
          "!bg-white !rounded-[0px] !border-neutral-100 !border-r-[0]",
          buttonClass,
        )}
        dropdownClass="!shadow-lg !font-serif !border-neutral-100 !text-sm !top-[40px]"
        country={defaultCountry ?? "us"}
      />
      {error && <p className="text-xs font-semibold text-red-400">{error}</p>}
    </div>
  );
};
