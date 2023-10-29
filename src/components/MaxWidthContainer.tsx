import { cn } from "~/lib/utils";
import { forwardRef } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const MaxWidthContainer = forwardRef<HTMLDivElement, Props>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn("max-w-[1200px] mx-auto", className)}>
        {children}
      </div>
    );
  },
);
