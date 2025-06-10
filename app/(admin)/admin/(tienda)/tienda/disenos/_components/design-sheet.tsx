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
import { Textarea } from "@/components/ui/textarea";
import { Design } from "@/db/schema";
import { useCreateDesign, useUpdateDesign } from "../_hooks/designs";
import {
  createDesignSchema,
  CreateDesignSchema,
  UpdateDesignActionSchema,
  updateDesignSchema,
  UpdateDesignSchema,
} from "../_lib/validations";

interface DesignSheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
  type: "create" | "update";
  design: Design | null;
}

const messages: Record<"create" | "update", Record<string, string>> = {
  create: {
    title: "Crear Diseño",
    description: "Añade un nuevo diseño a tu tienda.",
    submit: "Crear",
    cancel: "Cancelar",
    saving: "Creando",
  },
  update: {
    title: "Actualizar Diseño",
    description: "Realiza cambios en un diseño existente.",
    submit: "Actualizar",
    cancel: "Cancelar",
    saving: "Actualizando",
  },
};

export function DesignSheet({ type, design, ...props }: DesignSheetProps) {
  const { mutate: createDesign, isPending: isCreating } = useCreateDesign();
  const { mutate: updateDesign, isPending: isUpdating } = useUpdateDesign();

  const isPending = isCreating || isUpdating;

  const form = useForm<CreateDesignSchema | UpdateDesignSchema>({
    resolver: zodResolver(
      type === "create" ? createDesignSchema : updateDesignSchema,
    ),
    defaultValues: {
      name: design?.name ?? "",
      code: design?.code ?? "",
      description: design?.description ?? "",
      active: design?.active ?? true,
    },
  });

  useEffect(() => {
    if (type === "create") {
      form.reset({
        name: "",
        code: "",
        description: "",
        active: true,
      });
    } else if (design) {
      form.reset({
        name: design.name,
        code: design.code,
        description: design.description ?? "",
        active: design.active,
      });
    }
  }, [form, design, type]);

  const onSubmit = async (values: CreateDesignSchema | UpdateDesignSchema) => {
    if (type === "create") {
      createDesign(values as CreateDesignSchema, {
        onSuccess: () => {
          form.reset();
          props.onOpenChange?.(false);
        },
      });
    } else if (design) {
      const input = {
        id: design.id,
        ...values,
      } as UpdateDesignActionSchema;
      updateDesign(input, {
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
                        <Input {...field} placeholder="Nombre del diseño" />
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
                          placeholder="Código del diseño (ej. T-SHIRT-001)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descripción del diseño"
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
                          Mostrar este diseño en la tienda
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
