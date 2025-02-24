"use client";

import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useTransitionRouter } from "next-view-transitions";
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
import { UserRole } from "@/types/enum";
import { register } from "../_lib/actions";
import { formSchema } from "../_lib/validations";

export const RegisterForm: React.FC = () => {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const email = searchParams.get("email");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: email ?? "",
      password: "",
      confirmPassword: "",
      role: UserRole.USER,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.REGISTERED_USER);
      router.push(AuthPaths.LOGIN);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (email && values.email !== email) {
      toast.error(
        "El correo electrónico no coincide con el código de invitación",
      );
      return;
    }

    mutate({
      ...values,
      code: code ?? undefined,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4"
        aria-busy={isPending}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input disabled={isPending} type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos</FormLabel>
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
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
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <PasswordInput disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <LoadingButton
          loadingStates={[
            {
              isLoading: isPending,
              text: "Creando cuenta",
            },
          ]}
          type="submit"
        >
          Crear una cuenta
        </LoadingButton>
        <Separator />
        <GoogleSignInButton isPending={isPending} />
        <InstagramSignInButton isPending={isPending} />
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href={AuthPaths.LOGIN} className="underline">
            Iniciar sesión
          </Link>
        </div>
      </form>
    </Form>
  );
};
