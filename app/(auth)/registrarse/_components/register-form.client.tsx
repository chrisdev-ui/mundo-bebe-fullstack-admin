"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { PASSWORD_VALIDATION_REGEX } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/server/client";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "El nombre es requerido" }).max(50),
    lastName: z
      .string()
      .min(1, { message: "El apellido es requerido" })
      .max(50),
    email: z.string().email({ message: "Correo electrónico inválido" }),
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .max(16, { message: "La contraseña no puede tener más de 16 caracteres" })
      .regex(PASSWORD_VALIDATION_REGEX, {
        message:
          "Tu contraseña no es válida. Debe contener al menos una letra minúscula, una letra mayúscula, un dígito y un carácter especial",
      }),
    confirmPassword: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .max(16)
      .regex(PASSWORD_VALIDATION_REGEX, {
        message:
          "Tu contraseña no es válida. Debe contener al menos una letra minúscula, una letra mayúscula, un dígito y un carácter especial",
      }),
    role: z.enum(["USER", "ADMIN"]).default("USER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const code = searchParams.get("code");
  const email = searchParams.get("email");

  const { data: isValidCode, isFetching } =
    trpc.invitations.checkValidCode.useQuery(
      {
        code: code as string,
        email: email as string,
      },
      {
        enabled: !!code && !!email,
      },
    );

  const { mutate: createUser, isPending } = trpc.users.create.useMutation({
    onSuccess: () => {
      toast({
        variant: "success",
        description: "Cuenta creada exitosamente",
      });
      router.push("/iniciar-sesion");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error.message,
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: email ?? "",
      password: "",
      confirmPassword: "",
      role: "USER",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (email != null && values.email !== email) {
      toast({
        description:
          "El correo electrónico no coincide con el código de invitación",
        variant: "destructive",
      });
      return;
    }
    createUser({ ...values, role: isValidCode ? "ADMIN" : "USER" });
  };

  useEffect(() => {
    if (isValidCode !== undefined && !isValidCode) {
      toast({
        description: "Código de invitación no válido o vencido",
        variant: "destructive",
      });
    }
  }, [isValidCode, toast]);

  const isLoadingStates = [
    { isLoading: isFetching, text: "Validando código" },
    { isLoading: isPending, text: "Creando cuenta" },
  ];

  const isLoading = isPending || isFetching;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4"
        aria-busy={isLoading}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} type="text" {...field} />
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
                  <Input type="text" disabled={isLoading} {...field} />
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
                  <Input type="email" disabled={isLoading} {...field} />
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
                  <PasswordInput disabled={isLoading} {...field} />
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
                  <PasswordInput disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <LoadingButton loadingStates={isLoadingStates} type="submit">
          Crear una cuenta
        </LoadingButton>
        <Separator />
        <GoogleSignInButton isPending={isLoading} />
        <InstagramSignInButton isPending={isLoading} />
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/iniciar-sesion" className="underline">
            Iniciar sesión
          </Link>
        </div>
      </form>
    </Form>
  );
};
