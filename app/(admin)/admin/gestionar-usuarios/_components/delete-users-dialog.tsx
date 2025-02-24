"use client";

import * as React from "react";
import { IconLoader } from "@tabler/icons-react";
import type { Row } from "@tanstack/react-table";
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
import type { User } from "@/db/schema";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useDeleteUsers } from "../_hooks/users";

interface DeleteUsersDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  usersToDelete: Row<User>["original"][];
  showTrigger?: boolean;
  onSuccess?: () => void;
}

export function DeleteUsersDialog({
  usersToDelete,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteUsersDialogProps) {
  const { mutate: deleteUsers, isPending: isDeletePending } = useDeleteUsers();
  const isDesktop = useMediaQuery("(min-width: 640px)");

  function onDelete() {
    deleteUsers(
      {
        ids: usersToDelete.map((user) => user.id),
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
              Eliminar ({usersToDelete.length})
            </Button>
          </DialogTrigger>
        ) : null}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás completamente seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              <span className="font-medium">{usersToDelete.length}</span>
              {usersToDelete.length === 1 ? " el usuario" : " los usuarios"} de
              nuestros servidores.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              aria-label="Eliminar usuarios seleccionados"
              variant="destructive"
              onClick={onDelete}
              disabled={isDeletePending}
            >
              {isDeletePending && (
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
            Eliminar ({usersToDelete.length})
          </Button>
        </DrawerTrigger>
      ) : null}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>¿Estás completamente seguro?</DrawerTitle>
          <DrawerDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente
            <span className="font-medium">{usersToDelete.length}</span>
            {usersToDelete.length === 1 ? " usuario" : " usuarios"} de nuestros
            servidores.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="gap-2 sm:space-x-0">
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
          <Button
            aria-label="Eliminar usuarios seleccionados"
            variant="destructive"
            onClick={onDelete}
            disabled={isDeletePending}
          >
            {isDeletePending && (
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
