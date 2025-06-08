"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button, LoadingButton } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
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
import type { Color } from "@/db/schema";
import { useCreateColor, useUpdateColor } from "../_hooks/colors";
import {
  createColorSchema,
  CreateColorSchema,
  UpdateColorActionSchema,
  updateColorSchema,
  UpdateColorSchema,
} from "../_lib/validations";

interface ColorSheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
  type: "create" | "update";
  color: Color | null;
}

const messages: Record<"create" | "update", Record<string, string>> = {
  create: {
    title: "Crear Color",
    description: "Añade un nuevo color a tu tienda.",
    submit: "Crear",
    cancel: "Cancelar",
    saving: "Creando",
  },
  update: {
    title: "Actualizar Color",
    description: "Realiza cambios en un color existente.",
    submit: "Actualizar",
    cancel: "Cancelar",
    saving: "Actualizando",
  },
};

export function ColorSheet({ type, color, ...props }: ColorSheetProps) {
  const { mutate: createColor, isPending: isCreating } = useCreateColor();
  const { mutate: updateColor, isPending: isUpdating } = useUpdateColor();

  const isPending = isCreating || isUpdating;

  const form = useForm<CreateColorSchema | UpdateColorSchema>({
    resolver: zodResolver(
      type === "create" ? createColorSchema : updateColorSchema,
    ),
    defaultValues: {
      name: color?.name ?? "",
      code: color?.code ?? "",
      active: color?.active ?? true,
    },
  });

  useEffect(() => {
    if (type === "create") {
      form.reset({
        name: "",
        code: "",
        active: true,
      });
    } else if (color) {
      form.reset({
        name: color.name,
        code: color.code,
        active: color.active,
      });
    }
  }, [form, color, type]);

  const onSubmit = async (values: CreateColorSchema | UpdateColorSchema) => {
    if (type === "create") {
      createColor(values as CreateColorSchema, {
        onSuccess: () => {
          form.reset();
          props.onOpenChange?.(false);
        },
      });
    } else if (color) {
      const input = {
        id: color.id,
        ...values,
      } as UpdateColorActionSchema;
      updateColor(input, {
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
                        <Input {...field} placeholder="Nombre del color" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <ColorPicker
                          {...field}
                          onChange={(c) => field.onChange(c)}
                          value={field.value as string}
                          showPresets={false}
                          showRecent={false}
                          enablePointerEvents
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
                          Mostrar este color en la tienda
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
