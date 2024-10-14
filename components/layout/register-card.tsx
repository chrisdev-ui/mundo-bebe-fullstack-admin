import { RegisterForm } from "@/components/form/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const RegisterCard: React.FC = () => {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-[50px] font-extrabold leading-[1.18em]">
          Registrarse
        </CardTitle>
        <CardDescription className="text-center">
          Introduce tu información para crear una cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
};
