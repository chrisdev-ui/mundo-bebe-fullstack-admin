import Image from "next/image";
import { AspectRatioProps } from "@radix-ui/react-aspect-ratio";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface DataTableCellImageProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio: AspectRatioProps["ratio"];
  src: React.ComponentProps<typeof Image>["src"];
  alt: React.ComponentProps<typeof Image>["alt"];
  numberOfImages?: number;
}

export function DataTableCellImage({
  className,
  ratio,
  src,
  alt,
  numberOfImages = 1,
  ...props
}: DataTableCellImageProps) {
  return (
    <div className={cn("relative w-16", className)} {...props}>
      <AspectRatio ratio={ratio} className="relative z-10 bg-muted">
        <Image
          src={src || "/placeholder.svg"}
          fill
          alt={alt}
          className="rounded-md object-cover"
          unoptimized
        />
      </AspectRatio>
      {numberOfImages > 1 && (
        <div className="absolute -right-2 -top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
          {numberOfImages}
        </div>
      )}
    </div>
  );
}
