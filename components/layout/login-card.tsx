import { LoginForm } from "@/components/form/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const LoginCard: React.FC = () => {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-[50px] font-extrabold leading-[1.18em]">
          Iniciar sesión
        </CardTitle>
        <CardDescription>
          Introduce tu información para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
};
