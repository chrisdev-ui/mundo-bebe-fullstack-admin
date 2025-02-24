"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "next-view-transitions";
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
import { Input } from "@/components/ui/input";
import { AuthPaths } from "@/constants";
import { SUCCESS_MESSAGES } from "@/constants/messages";
import { forgotPassword } from "../_lib/actions";
import { forgotPasswordSchema as formSchema } from "../_lib/validations";

export const ForgotPasswordForm: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      form.reset();
      toast.info(SUCCESS_MESSAGES.FORGOT_PASSWORD);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tu correo electrónico"
                    disabled={isPending}
                    {...field}
                  />
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
              text: "Recuperando contraseña",
            },
          ]}
          type="submit"
        >
          Recuperar contraseña
        </LoadingButton>
        <div className="mt-4 text-center text-sm">
          ¿Recordaste tu contraseña?{" "}
          <Link href={AuthPaths.LOGIN} className="underline">
            Iniciar sesión
          </Link>
        </div>
      </form>
    </Form>
  );
};
