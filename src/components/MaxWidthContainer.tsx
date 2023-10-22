import { cn } from "~/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const MaxWidthContainer = ({ children, className }: Props) => {
  return (
    <div className={cn("max-w-[1200px] mx-auto", className)}>{children}</div>
  );
};
