"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconBrandGoogle, IconBrandInstagram } from "@tabler/icons-react";
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
import { useToast } from "@/components/ui/use-toast";
import { PASSWORD_VALIDATION_REGEX } from "@/constants";
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
  const { toast } = useToast();

  const createUser = trpc.users.create.useMutation({
    onSuccess: () => {
      toast({
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
      name: "Christian Gabriel",
      lastName: "Torres Martinez",
      email: "web.christian.dev@gmail.com",
      password: "KtmN$Pqx1",
      confirmPassword: "KtmN$Pqx1",
      role: "USER",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createUser.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Carlos Antonio" {...field} />
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
                  <Input type="text" placeholder="Perez Perez" {...field} />
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
                  <Input
                    type="email"
                    placeholder="carlos@example.com"
                    {...field}
                  />
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
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          Crear una cuenta
        </Button>
        <Separator />
        <Button variant="outline" className="flex w-full gap-2.5">
          <IconBrandGoogle size={25} />
          Registrarse con Google
        </Button>
        <Button variant="outline" className="flex w-full gap-2.5">
          <IconBrandInstagram size={25} />
          Registrarse con Instagram
        </Button>
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
