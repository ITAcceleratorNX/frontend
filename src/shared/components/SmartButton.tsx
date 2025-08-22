// src/components/ui/smart-button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success: "bg-emerald-600 text-white hover:bg-emerald-600/90",
        warning: "bg-amber-500 text-white hover:bg-amber-500/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5 text-base rounded-xl",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface SmartButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Рендер в другой тег через Radix Slot (напр. Link) */
  asChild?: boolean;
  /** Состояние загрузки — покажет спиннер и задизейблит кнопку */
  isLoading?: boolean;
  /** Иконка слева от текста */
  leftIcon?: React.ReactNode;
  /** Иконка справа от текста */
  rightIcon?: React.ReactNode;
}

export const SmartButton = React.forwardRef<HTMLButtonElement, SmartButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        data-loading={isLoading ? "true" : undefined}
        {...props}
      >
        {/* Левый блок: спиннер или иконка */}
        {isLoading ? (
          <Loader2 className={cn("mr-2 h-4 w-4 animate-spin", size === "icon" && "mr-0")} />
        ) : (
          leftIcon && (
            <span className={cn("mr-2", size === "icon" && "mr-0")}>{leftIcon}</span>
          )
        )}

        {/* Текст (для icon-size оставляем children по желанию) */}
        {children && <span className={cn(size === "icon" && "sr-only")}>{children}</span>}

        {/* Правая иконка */}
        {!isLoading && rightIcon && (
          <span className={cn("ml-2", size === "icon" && "ml-0")}>{rightIcon}</span>
        )}
      </Comp>
    );
  }
);
SmartButton.displayName = "SmartButton";

export { buttonVariants };