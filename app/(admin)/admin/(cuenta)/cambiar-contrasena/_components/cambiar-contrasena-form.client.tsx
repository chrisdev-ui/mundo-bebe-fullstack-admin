"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
import { SUCCESS_MESSAGES } from "@/constants/messages";
import { changePassword } from "../_lib/actions";
import { formSchema } from "../_lib/validations";

export const CambiarContrasenaForm: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const { mutate: handleChangePassword, isPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.PASSWORD_CHANGED);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    handleChangePassword(values);
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
              isLoading: isPending,
              text: "Actualizando contraseña",
            },
          ]}
          type="submit"
        >
          Cambiar contraseña
        </LoadingButton>
      </form>
    </Form>
  );
};
