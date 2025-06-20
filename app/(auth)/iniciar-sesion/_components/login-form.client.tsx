"use client";

import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "next-view-transitions";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  GoogleSignInButton,
  InstagramSignInButton,
} from "@/components/auth/auth-buttons.server";
import { LoadingButton } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { AuthPaths } from "@/constants";
import { SUCCESS_MESSAGES } from "@/constants/messages";
import { authenticate } from "@/lib/actions";
import { loginFormSchema as formSchema } from "@/types/schemas";

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl");

  const { mutate: auth, isPending } = useMutation({
    mutationFn: authenticate,
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "web.christian.dev@gmail.com",
      password: "KtmN$Pqx1",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("username", values.username);
    formData.append("password", values.password);
    auth({
      data: formData,
      redirectTo: callbackUrl ?? "/",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de usuario o correo electrónico</FormLabel>
                <FormControl>
                  <Input type="text" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <PasswordInput
                    showStrengthIndicator={false}
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Link
          href={AuthPaths.FORGOT_PASSWORD}
          className="ml-auto w-max text-right text-sm underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        <LoadingButton
          loadingStates={[
            {
              isLoading: isPending,
              text: "Iniciando sesión",
            },
          ]}
          type="submit"
        >
          Iniciar sesión
        </LoadingButton>
        <Separator />
        <GoogleSignInButton isPending={isPending} />
        <InstagramSignInButton isPending={isPending} />
        <div className="mt-4 text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link href={AuthPaths.SIGNUP} className="underline">
            Registrarse
          </Link>
        </div>
      </form>
    </Form>
  );
};
