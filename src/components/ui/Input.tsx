import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

    const inputElement = (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 text-muted-foreground pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error && "border-destructive focus-visible:ring-destructive bg-destructive/5",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-muted-foreground flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
    )

    if (!label && !error && !helperText) {
      return inputElement
    }

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center gap-1.5 text-xs font-bold text-kawral-green uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        {inputElement}
        {error && (
          <p className="text-[11px] font-semibold text-destructive ml-1 animate-fade-in">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-[11px] text-muted-foreground ml-1">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"
