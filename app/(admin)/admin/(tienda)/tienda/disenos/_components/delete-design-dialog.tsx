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
import { Design } from "@/db/schema";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useDeleteDesigns } from "../_hooks/designs";

interface DeleteDesignsDialogProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  designsToDelete: Row<Design>["original"][];
  showTrigger?: boolean;
  onSuccess?: () => void;
}

export function DeleteDesignsDialog({
  designsToDelete,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteDesignsDialogProps) {
  const { mutateAsync: deleteDesigns, isPending } = useDeleteDesigns();
  const isDesktop = useMediaQuery("(min-width: 640px)");

  function onDelete() {
    deleteDesigns(
      {
        ids: designsToDelete.map((design) => design.id),
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
              Eliminar ({designsToDelete.length})
            </Button>
          </DialogTrigger>
        ) : null}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás completamente seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente{" "}
              <span className="font-medium">{designsToDelete.length}</span>
              {designsToDelete.length === 1 ? " el diseño" : " los diseños"} de
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
            Eliminar ({designsToDelete.length})
          </Button>
        </DrawerTrigger>
      ) : null}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>¿Estás completamente seguro?</DrawerTitle>
          <DrawerDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente{" "}
            <span className="font-medium">{designsToDelete.length}</span>
            {designsToDelete.length === 1 ? " diseño" : " diseños"} de nuestros
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
