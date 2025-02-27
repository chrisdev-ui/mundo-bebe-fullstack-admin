"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, LoadingButton } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SUCCESS_MESSAGES } from "@/constants/messages";
import { UserRoleValues } from "@/db/schema";
import { logout } from "@/lib/actions";
import { deleteAccount } from "../_lib/actions";
import { formSchema } from "../_lib/validations";

export const PrivacidadForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailConfirmation: "",
    },
  });

  const { mutate: handleDeleteAccount, isPending } = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async (result) => {
      toast.success(SUCCESS_MESSAGES.USER_DELETED);
      await logout();
    },
    onError: (error: Error) => {
      setIsOpen(false);
      form.reset();
      toast.error(error.message);
    },
  });

  const canDeleteAccount = (targetUserId: string) => {
    if (!session?.user) return false;

    switch (session.user.role) {
      case UserRoleValues.SUPER_ADMIN:
        return false;
      case UserRoleValues.ADMIN:
      case UserRoleValues.USER:
      case UserRoleValues.GUEST:
        return session.user.id === targetUserId;
      default:
        return false;
    }
  };

  const getDeleteButtonText = () => {
    switch (session?.user?.role) {
      case UserRoleValues.SUPER_ADMIN:
        return "No puedes eliminar tu propia cuenta como Super Administrador";
      case UserRoleValues.ADMIN:
        return "Eliminar cuenta";
      default:
        return "Eliminar mi cuenta";
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    handleDeleteAccount(values);
  };

  return (
    <div className="space-y-6">
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <IconTrash className="size-5" />
            Eliminar cuenta
          </CardTitle>
          <CardDescription>
            Esta acción eliminará permanentemente tu cuenta y todos tus datos.
            Esta acción no se puede deshacer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Al eliminar tu cuenta:
            <ul className="ml-4 mt-2 list-disc">
              <li>Tu perfil y datos personales serán eliminados</li>
              <li>No podrás acceder a la plataforma</li>
              <li>Esta acción es permanente e irreversible</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
              <LoadingButton
                variant="destructive"
                loadingStates={[
                  { isLoading: isPending, text: "Eliminando..." },
                ]}
                disabled={!canDeleteAccount(session?.user?.id as string)}
                title={
                  !canDeleteAccount(session?.user?.id as string)
                    ? "No tienes permisos para realizar esta acción"
                    : undefined
                }
              >
                {getDeleteButtonText()}
              </LoadingButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <IconAlertTriangle className="size-5" />
                      Confirmar eliminación de cuenta
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción es permanente y no se puede deshacer. Por
                      favor, escribe tu correo electrónico para confirmar.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="emailConfirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escribe tu correo electrónico</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={session?.user?.email as string}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => {
                        form.reset();
                        setIsOpen(false);
                      }}
                    >
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        type="submit"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={!form.formState.isValid || isPending}
                      >
                        Eliminar cuenta permanentemente
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </form>
              </Form>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
};
