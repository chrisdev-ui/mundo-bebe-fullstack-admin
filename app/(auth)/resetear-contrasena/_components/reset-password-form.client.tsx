"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useForm } from "react-hook-form";
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
import { AuthPaths, PASSWORD_VALIDATION_REGEX } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/server/client";

const formSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, {
        message: "La contraseña es requerida",
      })
      .regex(PASSWORD_VALIDATION_REGEX, {
        message: "La contraseña es inválida",
      }),
    confirmPassword: z
      .string()
      .min(1, {
        message: "La contraseña es requerida",
      })
      .regex(PASSWORD_VALIDATION_REGEX, {
        message: "La contraseña es inválida",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const ResetPasswordForm: React.FC = () => {
  const router = useTransitionRouter();
  const { toast } = useToast();
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

  const {
    mutate: resetPasswordSubmit,
    isPending,
    isError,
  } = trpc.users.resetPassword.useMutation({
    onSuccess: () => {
      toast({
        description: "Contraseña cambiada exitosamente",
        variant: "success",
      });
      router.push(AuthPaths.LOGIN);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    resetPasswordSubmit({
      token: token as string,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmPassword,
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
                  <PasswordInput disabled={isPending} {...field} />
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
              text: "Restableciendo contraseña",
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
