import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  as: Component = "main",
  ...props
}) => {
  return (
    <Component className={cn(className)} {...props}>
      {children}
    </Component>
  );
};
