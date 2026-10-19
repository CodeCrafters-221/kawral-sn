import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

    const textareaElement = (
      <textarea
        id={textareaId}
        ref={ref}
        className={cn(
          "flex min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          error && "border-destructive focus-visible:ring-destructive bg-destructive/5",
          className
        )}
        {...props}
      />
    )

    if (!label && !error && !helperText) {
      return textareaElement
    }

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="flex items-center gap-1.5 text-xs font-bold text-kawral-green uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        {textareaElement}
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
Textarea.displayName = "Textarea"
