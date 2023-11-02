import * as React from "react";
import TextareaAutosize, {
  type TextareaAutosizeProps,
} from "react-textarea-autosize";

import { cn } from "~/lib/utils";

export interface TextareaProps extends TextareaAutosizeProps {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <TextareaAutosize
        className={cn(
          "flex w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none placeholder:text-neutral-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
