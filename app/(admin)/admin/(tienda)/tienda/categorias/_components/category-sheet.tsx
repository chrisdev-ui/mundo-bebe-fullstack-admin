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
import { Category } from "@/db/schema";
import { slugify } from "@/lib/utils";
import { useCreateCategory, useUpdateCategory } from "../_hooks/categories";
import {
  createCategorySchema,
  CreateCategorySchema,
  UpdateCategoryActionSchema,
  updateCategorySchema,
  UpdateCategorySchema,
} from "../_lib/validations";

interface CategorySheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
  type: "create" | "update";
  category: Category | null;
}

const messages: Record<"create" | "update", Record<string, string>> = {
  create: {
    title: "Crear categoría",
    description: "Añade una nueva categoría a tu tienda.",
    submit: "Crear",
    cancel: "Cancelar",
    saving: "Creando",
  },
  update: {
    title: "Actualizar categoría",
    description: "Realiza cambios en una categoría existente.",
    submit: "Actualizar",
    cancel: "Cancelar",
    saving: "Actualizando",
  },
};

export function CategorySheet({
  category,
  type,
  ...props
}: CategorySheetProps) {
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const isPending = isCreating || isUpdating;

  const form = useForm<CreateCategorySchema | UpdateCategorySchema>({
    resolver: zodResolver(
      type === "create" ? createCategorySchema : updateCategorySchema,
    ),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      active: category?.active ?? true,
    },
  });

  useEffect(() => {
    if (type === "create") {
      form.reset({
        name: "",
        slug: "",
        description: "",
        active: true,
      });
    } else if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        active: category.active,
      });
    }
  }, [category, form, type]);

  const onSubmit = async (
    values: CreateCategorySchema | UpdateCategorySchema,
  ) => {
    if (type === "create") {
      createCategory(values as CreateCategorySchema, {
        onSuccess: () => {
          form.reset();
          props.onOpenChange?.(false);
        },
      });
    } else if (category) {
      const input = {
        id: category.id,
        ...values,
      } as UpdateCategoryActionSchema;
      updateCategory(input, {
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
                        <Input
                          {...field}
                          placeholder="Nombre de la categoría"
                          onChange={(e) => {
                            field.onChange(e);
                            const currentSlug = form.getValues("slug");
                            const previousName = field.value;
                            const slugifiedPreviousName = slugify(
                              previousName as string,
                            );

                            if (
                              !currentSlug ||
                              currentSlug === slugifiedPreviousName
                            ) {
                              form.setValue("slug", slugify(e.target.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identificador</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="identificador-categoria"
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
                          placeholder="Descripción de la categoría"
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
                          Mostrar esta categoría en la tienda
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
