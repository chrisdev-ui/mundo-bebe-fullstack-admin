"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "next-view-transitions";
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
import { AuthPaths } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/server/client";
import { changePasswordSchema as formSchema } from "@/types/schemas";

export const CambiarContrasenaForm: React.FC = () => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const { mutate: changePasswordSubmit, isPending } =
    trpc.users.changePassword.useMutation({
      onSuccess: (result) => {
        form.reset();
        toast({
          description: result?.message,
          variant: "success",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          description: error.message,
        });
      },
    });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    changePasswordSubmit({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col space-y-8"
        aria-busy={isPending}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña actual</FormLabel>
                <FormControl>
                  <PasswordInput
                    disabled={isPending}
                    {...field}
                    showStrengthIndicator={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="confirmNewPassword"
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
              isLoading: form.formState.isSubmitting || isPending,
              text: "Actualizando contraseña",
            },
          ]}
          type="submit"
        >
          Cambiar contraseña
        </LoadingButton>
        <div className="animate-fade-right text-center text-sm animate-once">
          ¿Olvidaste tu contraseña?{" "}
          <Link href={AuthPaths.FORGOT_PASSWORD} className="underline">
            Recuperar contraseña
          </Link>
        </div>
      </form>
    </Form>
  );
};
