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
import { Size } from "@/db/schema";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useDeleteSizes } from "../_hooks/sizes";

interface DeleteSizesDialogProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  sizesToDelete: Row<Size>["original"][];
  showTrigger?: boolean;
  onSuccess?: () => void;
}

export function DeleteSizesDialog({
  sizesToDelete,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteSizesDialogProps) {
  const { mutateAsync: deleteSizes, isPending } = useDeleteSizes();
  const isDesktop = useMediaQuery("(min-width: 640px)");

  function onDelete() {
    deleteSizes(
      {
        ids: sizesToDelete.map((size) => size.id),
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
              Eliminar ({sizesToDelete.length})
            </Button>
          </DialogTrigger>
        ) : null}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás completamente seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente{" "}
              <span className="font-medium">{sizesToDelete.length}</span>
              {sizesToDelete.length === 1 ? " la talla" : " las tallas"} de
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
            Eliminar ({sizesToDelete.length})
          </Button>
        </DrawerTrigger>
      ) : null}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>¿Estás completamente seguro?</DrawerTitle>
          <DrawerDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente{" "}
            <span className="font-medium">{sizesToDelete.length}</span>
            {sizesToDelete.length === 1 ? " talla" : " tallas"} de nuestros
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
