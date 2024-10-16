"use client";

import { useRef } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconX } from "@tabler/icons-react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { loginFormSchema as formSchema } from "@/types/schemas";
import {
  GoogleSignInButton,
  InstagramSignInButton,
} from "../auth/auth-buttons";

export const LoginForm: React.FC = () => {
  const [state, formAction, isPending] = useFormState(authenticate, {
    message: "",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "web.christian.dev@gmail.com",
      password: "KtmN$Pqx1",
      ...(state?.fields ?? {}),
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={(evt) => {
          evt.preventDefault();
          form.handleSubmit(() => {
            formAction(new FormData(formRef.current!));
          })(evt);
        }}
        className="grid gap-4"
      >
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de usuario o correo electrónico</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
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
                  <PasswordInput {...field} />
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
        <Button
          size="xl"
          type="submit"
          className="w-full"
          disabled={isPending}
          aria-disabled={isPending}
        >
          Iniciar sesión
        </Button>
        {state?.message !== "" && !state.issues && (
          <div className="text-center text-sm text-red-500">
            {state.message}
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
