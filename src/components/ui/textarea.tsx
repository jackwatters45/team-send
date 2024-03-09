import * as React from "react";
import TextArea, {
  type TextAreaRef,
  type TextAreaProps as RcTextAreaProps,
} from "rc-textarea";

import { cn } from "@/lib/utils";

export type TextareaProps = RcTextAreaProps &
  React.ComponentPropsWithoutRef<"textarea">;

const Textarea = React.forwardRef<TextAreaRef, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextArea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:bg-stone-900 dark:ring-offset-stone-950 dark:placeholder:text-stone-400 dark:focus-visible:ring-stone-300",
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
