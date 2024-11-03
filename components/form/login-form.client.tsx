"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconX } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
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
import { authenticate } from "@/lib/actions";
import { FormState } from "@/types";
import { loginFormSchema as formSchema } from "@/types/schemas";

export const LoginForm: React.FC = () => {
  const [state, setState] = useState<FormState>();
  const [isPending, setIsPending] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "web.christian.dev@gmail.com",
      password: "KtmN$Pqx128",
      ...(state?.fields ?? {}),
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("username", values.username);
    formData.append("password", values.password);
    try {
      setIsPending(true);
      const newState = await authenticate(undefined, formData);
      setState(newState);
      setIsPending(false);
    } catch (error) {
      setIsPending(false);
      setState({
        message: "Algo salió mal. Por favor, intenta de nuevo",
      });
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (state?.message !== "") {
      setTimeout(() => {
        setState(undefined);
      }, 2000);
    }
  }, [state]);

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
                  <PasswordInput disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Link
          href="/recuperar-contrasena"
          className="text-right text-sm underline"
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
        {state?.message !== "" && !state?.issues && (
          <div className="text-center text-sm text-red-500">
            {state?.message}
          </div>
        )}
        {state?.issues && (
          <div className="text-center text-sm text-red-500">
            <ul>
              {state.issues.map((issue) => (
                <li key={issue} className="flex gap-1">
                  <IconX color="red" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Separator />
        <GoogleSignInButton isPending={isPending} />
        <InstagramSignInButton isPending={isPending} />
        <div className="mt-4 text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link href="/registrarse" className="underline">
            Registrarse
          </Link>
        </div>
      </form>
    </Form>
  );
};
