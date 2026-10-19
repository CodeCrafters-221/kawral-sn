import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/src/lib/utils"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-kawral-darkgreen shadow-xs hover:shadow-md",
        primary:
          "bg-kawral-green text-white hover:bg-kawral-darkgreen shadow-xs hover:shadow-md",
        accent:
          "bg-kawral-orange text-white hover:bg-kawral-orange-hover shadow-xs hover:shadow-md shadow-kawral-orange/20",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs",
        outline:
          "border border-input bg-background hover:bg-slate-100 hover:text-foreground",
        outlineAccent:
          "border border-kawral-orange/40 text-kawral-orange hover:bg-kawral-orange/5",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-kawral-border",
        ghost:
          "hover:bg-slate-100 hover:text-foreground text-kawral-muted",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-7 text-xs px-2.5 rounded-lg gap-1.5",
        sm: "h-9 rounded-lg px-3 text-xs gap-1.5",
        md: "h-10 px-5 py-2.5 rounded-xl gap-2",
        lg: "h-12 rounded-2xl px-6 text-base font-bold gap-2.5",
        icon: "h-9 w-9 p-0 rounded-xl justify-center",
        iconSm: "h-7 w-7 p-0 rounded-lg justify-center",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)
Button.displayName = "Button"
