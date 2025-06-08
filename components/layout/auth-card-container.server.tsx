import Image from "next/image";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthCardContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const AuthCardContainer: React.FC<AuthCardContainerProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <div className="mx-auto w-full max-w-24">
          <AspectRatio ratio={1 / 1}>
            <Image
              src="/images/logo_mundo_bebe.svg"
              alt="Logo de Pañalera Mundo Bebé"
              fill
              className="object-cover"
            />
          </AspectRatio>
        </div>
        <CardTitle className="text-center text-[50px] font-extrabold leading-[1.18em]">
          {title}
        </CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
