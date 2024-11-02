import * as React from "react";
import { IconHorseToy } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

interface LoaderProps extends React.ComponentPropsWithoutRef<"div"> {
  size?: "sm" | "md" | "lg";
  color?: string;
  stroke?: number;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
};

const HorseLoader = React.forwardRef<HTMLDivElement, LoaderProps>(
  (
    { size = "sm", color = "currentColor", stroke = 1.5, className, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center justify-center", className)}
        role="status"
        {...props}
      >
        <div className="animate-balance">
          <IconHorseToy size={sizeMap[size]} color={color} stroke={stroke} />
        </div>
        <span className="sr-only">Cargando...</span>
      </div>
    );
  },
);
HorseLoader.displayName = "HorseLoader";

export { HorseLoader };
