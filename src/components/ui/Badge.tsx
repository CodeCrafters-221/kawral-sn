import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckCircle2, Star } from "lucide-react"
import { cn } from "@/src/lib/utils"

export const badgeVariants = cva(
  "inline-flex items-center gap-1 font-bold tracking-tight select-none transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/80",
        outline:
          "text-foreground border border-border",
        verified:
          "bg-kawral-green text-white shadow-xs",
        rating:
          "bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs",
        accent:
          "bg-kawral-orange/10 text-kawral-orange border border-kawral-orange/25",
        primary:
          "bg-kawral-green/10 text-kawral-green border border-kawral-green/20",
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-200",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200",
      },
      size: {
        default: "text-xs px-2.5 py-0.5 rounded-full",
        sm: "text-[10px] px-2 py-0.5 rounded-full",
        md: "text-xs px-2.5 py-1 rounded-xl",
        lg: "text-sm px-3.5 py-1.5 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

export function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : variant === "verified" ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-kawral-orange shrink-0" />
      ) : variant === "rating" ? (
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
      ) : null}
      {children}
    </div>
  )
}
