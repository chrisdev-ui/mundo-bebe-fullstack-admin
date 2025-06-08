"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button, LoadingButton } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Size } from "@/db/schema";
import { useCreateSize, useUpdateSize } from "../_hooks/sizes";
import {
  createSizeSchema,
  CreateSizeSchema,
  UpdateSizeActionSchema,
  updateSizeSchema,
  UpdateSizeSchema,
} from "../_lib/validations";

interface SizeSheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
  type: "create" | "update";
  size: Size | null;
}

const messages: Record<"create" | "update", Record<string, string>> = {
  create: {
    title: "Crear Talla",
    description: "Añade una nueva talla a tu tienda.",
    submit: "Crear",
    cancel: "Cancelar",
    saving: "Creando",
  },
  update: {
    title: "Actualizar Talla",
    description: "Realiza cambios en una talla existente.",
    submit: "Actualizar",
    cancel: "Cancelar",
    saving: "Actualizando",
  },
};

export function SizeSheet({ type, size, ...props }: SizeSheetProps) {
  const { mutate: createSize, isPending: isCreating } = useCreateSize();
  const { mutate: updateSize, isPending: isUpdating } = useUpdateSize();

  const isPending = isCreating || isUpdating;

  const form = useForm<CreateSizeSchema | UpdateSizeSchema>({
    resolver: zodResolver(
      type === "create" ? createSizeSchema : updateSizeSchema,
    ),
    defaultValues: {
      name: size?.name ?? "",
      code: size?.code ?? "",
      active: size?.active ?? true,
    },
  });

  useEffect(() => {
    if (type === "create") {
      form.reset({
        name: "",
        code: "",
        active: true,
      });
    } else if (size) {
      form.reset({
        name: size.name,
        code: size.code,
        active: size.active,
      });
    }
  }, [form, size, type]);

  const onSubmit = async (values: CreateSizeSchema | UpdateSizeSchema) => {
    if (type === "create") {
      createSize(values as CreateSizeSchema, {
        onSuccess: () => {
          form.reset();
          props.onOpenChange?.(false);
        },
      });
    } else if (size) {
      const input = {
        id: size.id,
        ...values,
      } as UpdateSizeActionSchema;
      updateSize(input, {
        onSuccess: () => {
          form.reset();
          props.onOpenChange?.(false);
        },
      });
    }
  };

  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col gap-6 p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            <SheetHeader className="text-left">
              <SheetTitle>{messages[type].title}</SheetTitle>
              <SheetDescription>{messages[type].description}</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4 pt-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nombre de la talla" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Código de la talla (ej. M, L, XL)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-2 space-y-0 rounded-lg border p-4">
                      <FormLabel className="flex flex-col items-start gap-1">
                        <span>Activo</span>
                        <span className="font-normal text-muted-foreground">
                          Mostrar esta talla en la tienda
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <SheetFooter className="mt-2 gap-2 pt-2 sm:space-x-0">
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
                    {messages[type].submit}
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
