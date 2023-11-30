import * as React from "react";

import { Label } from "./label";
import { cn } from "~/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      containerClassName,
      id: propsId,
      label,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const id = React.useId();

    return (
      <div className={cn("flex flex-col gap-1", containerClassName)}>
        <div className="relative input-container">
          <input
            id={propsId ?? id}
            type={type}
            className={cn(
              "flex w-full transition-all duration-300 border py-4 px-5 placeholder:text-neutral-700 border-neutral-100 bg-white text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              "input-main",
              className,
            )}
            placeholder={placeholder ?? " "}
            ref={ref}
            {...props}
          />
          {label && (
            <Label
              htmlFor={propsId ?? id}
              className="cursor-text input-label absolute z-0 text-sm text-neutral-700 bg-none transition-all duration-300"
            >
              {label}
            </Label>
          )}
        </div>
        {error && <p className="text-xs font-semibold text-red-400">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
