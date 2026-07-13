import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-background/60 px-4 text-sm text-ink tnum placeholder:text-ink-soft/60 transition-colors duration-200 ease-calm focus-visible:outline-none focus-visible:border-accent/30 focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[92px] w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-soft/60 transition-colors duration-200 ease-calm focus-visible:outline-none focus-visible:border-accent/30 focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-xs font-medium uppercase tracking-[0.12em] text-ink-soft",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Input, Textarea, Label };
