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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useToast } from "@/hooks/use-toast";
import { editProfileSchema as formSchema } from "@/types/schemas";

export const EditarPerfilForm: React.FC = () => {
  const [previewImage, setPreviewImage] = useState<string>();
  const { toast } = useToast();
  const {
    data: session,
    update,
    status,
  } = useSession({
    required: true,
  });

  const defaultValues = useMemo(
    () => ({
      avatar: session?.user.image,
      name: session?.user.name ?? "",
      lastName: session?.user.lastName ?? "",
      username: session?.user.username ?? "",
      email: session?.user.email ?? "",
      phoneNumber: session?.user.phoneNumber ?? "",
    }),
    [session],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let blob: PutBlobResult | null = null;
    if (values.avatar instanceof File) {
      blob = await upload(values.avatar.name, values.avatar, {
        access: "public",
        handleUploadUrl: "/api/avatar/upload",
      });
    }
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
                <Input {...field} placeholder="Nombre" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <Input {...field} placeholder="Apellido" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de usuario</FormLabel>
                <Input {...field} placeholder="Nombre de usuario" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <Input {...field} placeholder="Correo electrónico" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de teléfono</FormLabel>
                <PhoneInput
                  defaultCountry="CO"
                  international={false}
                  placeholder="Escribe tu número de teléfono"
                  {...field}
                />
              </FormItem>
            )}
          />
        </div>
        <LoadingButton loadingStates={[]} type="submit" className="">
          Actualizar perfil
        </LoadingButton>
      </form>
    </Form>
  );
};
