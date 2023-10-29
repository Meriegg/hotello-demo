import { cn } from "~/lib/utils";
import { Loader2 } from "lucide-react";

interface Props {
  label?: string | null;
  containerClassName?: string;
  loaderClassName?: string;
  labelClassName?: string;
}

export const Loader = (
  { label, containerClassName, loaderClassName, labelClassName }: Props,
) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 w-full justify-center py-4",
        containerClassName,
      )}
    >
      <Loader2
        className={cn("animate-spin w-4 h-4 text-neutral-900", loaderClassName)}
      />
      {label === null
        ? null
        : (
          <p className={cn("text-sm text-neutral-700", labelClassName)}>
            {label ?? "Loading"}
          </p>
        )}
    </div>
  );
};
