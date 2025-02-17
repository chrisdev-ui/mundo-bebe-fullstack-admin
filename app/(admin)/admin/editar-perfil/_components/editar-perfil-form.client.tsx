"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingButton } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { roleMappings } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/server/client";
import { UserRole } from "@/types";
import { editProfileSchema as formSchema } from "@/types/schemas";

export const EditarPerfilForm: React.FC = () => {
  const [previewImage, setPreviewImage] = useState<string>();
  const { toast } = useToast();
  const {
    data: session,
    update: updateSession,
    status,
  } = useSession({
    required: true,
  });

  const { mutate: updateUser, isPending } = trpc.users.update.useMutation();

  const defaultValues = useMemo(
    () => ({
      avatar: session?.user.image,
      name: session?.user.name ?? "",
      lastName: session?.user.lastName ?? "",
      username: session?.user.username ?? "",
      email: session?.user.email ?? "",
      phoneNumber: session?.user.phoneNumber ?? "",
      dob: session?.user?.dob ?? undefined,
      role: (session?.user?.role as UserRole) ?? UserRole.USER,
    }),
    [session],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let blob: PutBlobResult | null = null;
    try {
      if (values.avatar instanceof File) {
        blob = await upload(values.avatar.name, values.avatar, {
          access: "public",
          handleUploadUrl: "/api/avatar/upload",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        description: "Error al subir la imagen. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
    updateUser(
      {
        name: values.name,
        lastName: values.lastName,
        username: values.username,
        email: values.email,
        phoneNumber: values.phoneNumber,
        dob: values.dob,
        image: blob?.url,
      },
      {
        onSuccess: async (result) => {
          if (result?.isSuccess) {
            updateSession({
              user: {
                name: values.name,
                lastName: values.lastName,
                username: values.username,
                email: values.email,
                phoneNumber: values.phoneNumber,
                dob: values.dob,
                image: blob?.url,
              },
            });
            toast({
              description: result.message,
              variant: "success",
            });
          }
        },
        onError: async (error) => {
          console.error(error);
          toast({
            variant: "destructive",
            description: error.message,
          });
        },
      },
    );
  };

  useEffect(() => {
    if (status === "authenticated") {
      form.reset(defaultValues);
    }
  }, [status, defaultValues, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col space-y-8"
        aria-busy={isPending}
      >
        <div className="grid place-items-center">
          <FormField
            control={form.control}
            name="avatar"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className="relative">
                <FormLabel className="group cursor-pointer">
                  <Avatar className="size-24 rounded-full">
                    <AvatarImage
                      src={previewImage ?? (value as string)}
                      alt={`Imagen de perfil de ${session?.user.name}`}
                    />
                    <AvatarFallback className="size-full rounded-full text-4xl">
                      {session?.user.name?.slice(0, 2)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/50 text-center text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Cambiar imagen
                  </div>
                </FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setPreviewImage(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                        onChange(file);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nombre" />
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
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Apellido" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de usuario</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nombre de usuario" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Correo electrónico" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de teléfono</FormLabel>
                <FormControl>
                  <PhoneInput
                    defaultCountry="CO"
                    international={false}
                    placeholder="Escribe tu número de teléfono"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento</FormLabel>
                <FormControl>
                  <DatePicker
                    className="w-full"
                    name={field.name}
                    control={form.control}
                    showOptions={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={roleMappings[field.value] || field.value}
                    disabled
                    placeholder="Rol del usuario"
                  />
                </FormControl>
                <FormDescription>
                  Puedes cambiar tu rol en la sección de{" "}
                  <strong>Administración</strong>.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <LoadingButton
          loadingStates={[
            {
              isLoading: form.formState.isSubmitting || isPending,
              text: "Actualizando perfil",
            },
          ]}
          type="submit"
          className=""
        >
          Actualizar perfil
        </LoadingButton>
      </form>
    </Form>
  );
};
