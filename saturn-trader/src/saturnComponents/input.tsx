import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface BasicInputProps extends React.ComponentProps<typeof Input> {
  // Add any custom props need in the future here
}

export function BasicInput({
  className,
  type = "text",
  ...props
}: BasicInputProps) {
  return (
    <Input
      type={type}
      className={cn(
        "bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500",
        className,
      )}
      // Spread all other standard input props (value, onChange, placeholder, maxLength, etc.)
      {...props}
    />
  );
}
