import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { HorseLoader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/types";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-xl font-bold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export interface LoadingButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  loadingStates: LoadingState[];
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      className,
      loadingStates,
      children,
      size = "xl",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isLoading = loadingStates.some((state) => state.isLoading);

    const getButtonText = () => {
      const activeState = loadingStates.find((state) => state.isLoading);
      return activeState?.text ?? children;
    };

    return (
      <Button
        ref={ref}
        size={size}
        type={type}
        className="w-full"
        disabled={isLoading}
        aria-disabled={isLoading}
        {...props}
      >
        <div className="flex items-center gap-1.5">
          {isLoading && <HorseLoader />}
          {getButtonText()}
        </div>
      </Button>
    );
  },
);
LoadingButton.displayName = "LoadingButton";

export { Button, buttonVariants, LoadingButton };
