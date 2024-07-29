import { ForgotPasswordForm } from '@/components/form/forgot-password-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export const ForgotPasswordCard: React.FC = () => {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Recuperar tu contraseña</CardTitle>
        <CardDescription>
          Introduce tu correo electrónico y te enviaremos un enlace para
          recuperar tu contraseña
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  )
}
