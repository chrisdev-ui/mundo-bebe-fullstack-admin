"use client";

import { IconLoader } from "@tabler/icons-react";
import { Row } from "@tanstack/react-table";
import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ProductType } from "@/db/schema";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useDeleteProductTypes } from "../_hooks/product-types";

interface DeleteProductTypesDialogProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  productTypesToDelete: Row<ProductType>["original"][];
  showTrigger?: boolean;
  onSuccess?: () => void;
}

export function DeleteProductTypesDialog({
  productTypesToDelete,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteProductTypesDialogProps) {
  const { mutateAsync: deleteProductTypes, isPending } = useDeleteProductTypes();
  const isDesktop = useMediaQuery("(min-width: 640px)");

  function onDelete() {
    deleteProductTypes(
      {
        ids: productTypesToDelete.map((productType) => productType.id),
      },
      {
        onSuccess: () => {
          props.onOpenChange?.(false);
          onSuccess?.();
        },
      },
    );
  }

  if (isDesktop) {
    return (
      <Dialog {...props}>
        {showTrigger ? (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Trash className="mr-2 size-4" aria-hidden="true" />
              Eliminar ({productTypesToDelete.length})
            </Button>
          </DialogTrigger>
        ) : null}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás completamente seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente{" "}
              <span className="font-medium">{productTypesToDelete.length}</span>
              {productTypesToDelete.length === 1 ? " el tipo de producto" : " los tipos de producto"} de
              nuestros servidores.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isPending}
            >
              {isPending && (
                <IconLoader
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer {...props}>
      {showTrigger ? (
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash className="mr-2 size-4" aria-hidden="true" />
            Eliminar ({productTypesToDelete.length})
          </Button>
        </DrawerTrigger>
      ) : null}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>¿Estás completamente seguro?</DrawerTitle>
          <DrawerDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente{" "}
            <span className="font-medium">{productTypesToDelete.length}</span>
            {productTypesToDelete.length === 1 ? " tipo de producto" : " tipos de producto"} de nuestros
            servidores.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="gap-2 pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
          <Button variant="destructive" onClick={onDelete} disabled={isPending}>
            {isPending && (
              <IconLoader
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Eliminar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}