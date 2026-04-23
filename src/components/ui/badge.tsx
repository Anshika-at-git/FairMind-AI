import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "danger" | "warning" | "success"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80":
            variant === "default",
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80":
            variant === "secondary",
          "text-foreground": variant === "outline",
          "border-transparent bg-red-500/10 text-red-500": variant === "danger",
          "border-transparent bg-amber-500/10 text-amber-500": variant === "warning",
          "border-transparent bg-emerald-500/10 text-emerald-500": variant === "success",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
