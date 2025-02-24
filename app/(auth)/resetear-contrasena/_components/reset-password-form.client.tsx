"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { LoadingButton } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthPaths } from "@/constants";
import { SUCCESS_MESSAGES } from "@/constants/messages";
import { resetPassword } from "../_lib/actions";
import { formSchema } from "../_lib/validations";

export const ResetPasswordForm: React.FC = () => {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending, isError } = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.PASSWORD_CHANGED);
      router.push(AuthPaths.LOGIN);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!token) return;

    mutate({
      token,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    });
  };

  useEffect(() => {
    if (!token || !email) {
      router.push(AuthPaths.LOGIN);
    }
  }, [router, token, email]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nueva contraseña</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar nueva contraseña</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
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
              text: "Restableciendo",
            },
          ]}
          type="submit"
        >
          Restablecer contraseña
        </LoadingButton>
        {isError && (
          <div className="animate-fade-right text-center text-sm animate-once">
            Ha ocurrido un error al restablecer la contraseña. Por favor,
            intenta generar un nuevo enlace aquí:
            <br />
            <Link href={AuthPaths.FORGOT_PASSWORD} className="underline">
              Recuperar contraseña
            </Link>
          </div>
        )}
      </form>
    </Form>
  );
};
