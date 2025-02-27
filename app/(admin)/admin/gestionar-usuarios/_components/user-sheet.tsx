"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, LoadingButton } from "@/components/ui/button";
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
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { roleMappings } from "@/constants";
import { SUCCESS_MESSAGES } from "@/constants/messages";
import { UserRoleValues, type User } from "@/db/schema";
import { useCreateUser, useUpdateUser } from "../_hooks/users";
import {
  createUserSchema,
  CreateUserSchema,
  UpdateUserActionSchema,
  updateUserSchema,
  UpdateUserSchema,
} from "../_lib/validations";

interface UserSheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
  type: "create" | "update";
  user: User | null;
}

const messages: Record<"create" | "update", Record<string, string>> = {
  create: {
    title: "Crear usuario",
    description: "Crear un nuevo usuario.",
    submit: "Crear",
    cancel: "Cancelar",
    saving: "Creando",
    saved: SUCCESS_MESSAGES.USER_CREATED,
  },
  update: {
    title: "Actualizar usuario",
    description: "Actualizar los datos de un usuario y guardar los cambios.",
    submit: "Actualizar",
    cancel: "Cancelar",
    saving: "Actualizando",
    saved: SUCCESS_MESSAGES.USER_UPDATED,
  },
};

export function UserSheet({ user, type, ...props }: UserSheetProps) {
  const { data: session } = useSession({
    required: true,
  });
  const [previewImage, setPreviewImage] = useState<string>();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const isPending = isCreating || isUpdating;

  const form = useForm<CreateUserSchema | UpdateUserSchema>({
    resolver: zodResolver(
      type === "create" ? createUserSchema : updateUserSchema,
    ),
    defaultValues: {
      image: user?.image ?? "",
      name: user?.name ?? "",
      lastName: user?.lastName ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      dob: user?.dob ?? null,
      role: user?.role ?? UserRoleValues.USER,
      ...(type === "create" && { password: "" }),
    },
  });

  useEffect(() => {
    if (type === "create") {
      setPreviewImage(undefined);
      form.reset({
        image: "",
        name: "",
        lastName: "",
        username: "",
        email: "",
        phoneNumber: "",
        dob: null,
        role: UserRoleValues.USER,
        password: "",
      });
    } else if (user) {
      setPreviewImage(undefined);
      form.reset({
        image: user.image,
        name: user.name ?? "",
        lastName: user.lastName ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        phoneNumber: user.phoneNumber ?? "",
        dob: typeof user.dob === "string" ? new Date(user.dob) : user.dob,
        role: user.role,
      });
    }
  }, [user, form, type]);

  const onSubmit = async (values: CreateUserSchema | UpdateUserSchema) => {
    if (type === "create") {
      const input = values as CreateUserSchema;
      createUser(input, {
        onSuccess: () => {
          form.reset();
          props.onOpenChange?.(false);
        },
      });
    } else if (user) {
      const input = {
        id: user.id,
        ...values,
      } as UpdateUserActionSchema;
      updateUser(input, {
        onSuccess: () => {
          form.reset();
          props.onOpenChange?.(false);
        },
      });
    }
  };

  const getAvailableRoles = useMemo(() => {
    if (session?.user?.role === UserRoleValues.SUPER_ADMIN) {
      return [UserRoleValues.ADMIN, UserRoleValues.USER, UserRoleValues.GUEST];
    } else if (session?.user?.role === UserRoleValues.ADMIN) {
      return [UserRoleValues.USER, UserRoleValues.GUEST];
    }
    return [UserRoleValues.GUEST];
  }, [session]);

  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col gap-6 p-0 sm:max-w-md">
        <ScrollArea className="h-full">
          <div className="p-6">
            <SheetHeader className="text-left">
              <SheetTitle>{messages[type].title}</SheetTitle>
              <SheetDescription>{messages[type].description}</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="grid place-items-center">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className="relative">
                        <FormLabel className="group cursor-pointer">
                          <Avatar className="size-24 rounded-full">
                            <AvatarImage
                              src={previewImage ?? (value as string)}
                              alt={"Imagen de perfil"}
                            />
                            <AvatarFallback className="size-full rounded-full text-4xl">
                              {form
                                .getValues("name")
                                ?.slice(0, 2)
                                ?.toUpperCase()}
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
                {type === "create" ? (
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
                ) : null}
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
                          enablePointerEvents
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAvailableRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {roleMappings[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Los roles disponibles dependen de tu nivel de acceso.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="gap-2 pt-2 sm:space-x-0">
                  <SheetClose asChild>
                    <Button type="button" variant="outline">
                      {messages[type].cancel}
                    </Button>
                  </SheetClose>
                  <LoadingButton
                    type="submit"
                    size="default"
                    loadingStates={[
                      { isLoading: isPending, text: messages[type].saving },
                    ]}
                  >
                    {isPending ? messages[type].saving : messages[type].submit}
                  </LoadingButton>
                </SheetFooter>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
