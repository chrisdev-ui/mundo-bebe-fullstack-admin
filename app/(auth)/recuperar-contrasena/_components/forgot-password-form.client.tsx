"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/server/client";

const formSchema = z.object({
  email: z.string().email({ message: "Correo electrónico inválido" }),
});

export const ForgotPasswordForm: React.FC = () => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate: forgotPasswordSubmit, isPending } =
    trpc.users.forgotPassword.useMutation({
      onSuccess: () => {
        toast({
          description:
            "Se ha enviado un correo con las instrucciones para recuperar tu contraseña",
          variant: "success",
        });
        form.reset();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          description: error.message,
        });
        form.reset();
      },
    });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    forgotPasswordSubmit(values);
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
                    type="email"
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
          <Link href="/iniciar-sesion" className="underline">
            Iniciar sesión
          </Link>
        </div>
      </form>
    </Form>
  );
};
