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
        <CardTitle className="text-center text-[50px] font-extrabold leading-[1.18em]">
          {title}
        </CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
