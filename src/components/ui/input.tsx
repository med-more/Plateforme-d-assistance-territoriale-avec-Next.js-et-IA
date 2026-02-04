"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-lg border border-openai-gray/50 bg-openai-darker px-4 py-2.5 text-sm text-openai-text ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-openai-text placeholder:text-openai-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-openai-green/50 focus-visible:border-openai-green/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
