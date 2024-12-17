import * as React from "react";

import { cn } from "@/lib/utils";

const Heading = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: React.ElementType;
    title: string;
    description: string;
  }
>(
  (
    { className, children, as: Component = "h2", title, description, ...props },
    ref,
  ) => (
    <div ref={ref} className={cn(className)} {...props}>
      <Component className={cn("text-3xl font-bold tracking-tight")}>
        {title}
      </Component>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  ),
);
Heading.displayName = "Heading";

export { Heading };
