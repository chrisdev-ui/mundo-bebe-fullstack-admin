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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";
import {
  useCreateSubcategory,
  useUpdateSubcategory,
} from "../_hooks/subcategories";
import { getActiveCategories } from "../_lib/queries";
import {
  createSubcategorySchema,
  CreateSubcategorySchema,
  TableSubCategory,
  UpdateSubcategoryActionSchema,
  updateSubcategorySchema,
  UpdateSubcategorySchema,
} from "../_lib/validations";

interface SubcategorySheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  type: "create" | "update";
  subcategory: TableSubCategory | null;
  categories: Awaited<ReturnType<typeof getActiveCategories>>;
}

const messages: Record<"create" | "update", Record<string, string>> = {
  create: {
    title: "Crear subcategoría",
    description: "Añade una nueva subcategoría a tu tienda.",
    submit: "Crear",
    cancel: "Cancelar",
    saving: "Creando",
  },
  update: {
    title: "Actualizar subcategoría",
    description: "Realiza cambios en una subcategoría existente.",
    submit: "Actualizar",
    cancel: "Cancelar",
    saving: "Actualizando",
  },
};

export function SubcategorySheet({
  subcategory,
  categories,
  type,
  ...props
}: SubcategorySheetProps) {
  const { mutate: createSubcategory, isPending: isCreating } =
    useCreateSubcategory();
  const { mutate: updateSubcategory, isPending: isUpdating } =
    useUpdateSubcategory();

  const isPending = isCreating || isUpdating;

  const form = useForm<CreateSubcategorySchema | UpdateSubcategorySchema>({
    resolver: zodResolver(
      type === "create" ? createSubcategorySchema : updateSubcategorySchema,
    ),
    defaultValues: {
      name: subcategory?.name ?? "",
      slug: subcategory?.slug ?? "",
      description: subcategory?.description ?? "",
      categoryId: subcategory?.categoryId ?? "",
      active: subcategory?.active ?? true,
    },
  });

  useEffect(() => {
    if (type === "create") {
      form.reset({
        name: "",
        slug: "",
        description: "",
        categoryId: "",
        active: true,
      });
    } else if (subcategory) {
      form.reset({
        name: subcategory.name,
        slug: subcategory.slug,
        description: subcategory.description ?? "",
        categoryId: subcategory.categoryId,
        active: subcategory.active,
      });
    }
  }, [subcategory, form, type]);

  const onSubmit = async (
    values: CreateSubcategorySchema | UpdateSubcategorySchema,
  ) => {
    if (type === "create") {
      createSubcategory(values as CreateSubcategorySchema, {
        onSuccess: () => {
          form.reset();
          props.onOpenChange?.(false);
        },
      });
    } else if (subcategory) {
      const input = {
        id: subcategory.id,
        ...values,
      } as UpdateSubcategoryActionSchema;
      updateSubcategory(input, {
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
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nombre de la subcategoría"
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
                          placeholder="identificador-subcategoria"
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
                          placeholder="Descripción de la subcategoría"
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
                          Mostrar esta subcategoría en la tienda
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
