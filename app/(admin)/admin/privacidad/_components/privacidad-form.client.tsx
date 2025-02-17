"use client";

import { useState } from "react";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { useSession } from "next-auth/react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/actions";
import { trpc } from "@/server/client";
import { UserRole } from "@/types";

export const PrivacidadForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const { data: session } = useSession();
  const { toast } = useToast();

  const { mutate: deleteAccount, isPending } = trpc.users.delete.useMutation({
    onSuccess: async (result) => {
      if (result?.isSuccess) {
        toast({
          description: result.message,
          variant: "success",
        });
        await logout();
      }
    },
    onError: (error) => {
      setIsOpen(false);
      setEmailConfirmation("");
      toast({
        variant: "destructive",
        description: error.message,
      });
    },
  });

  const canDeleteAccount = (targetUserId: string) => {
    if (!session?.user) return false;

    switch (session.user.role) {
      case UserRole.SUPER_ADMIN:
        return session.user.id !== targetUserId;
      case UserRole.ADMIN:
      case UserRole.USER:
      case UserRole.GUEST:
        return session.user.id === targetUserId;
      default:
        return false;
    }
  };

  const getDeleteButtonText = () => {
    switch (session?.user?.role) {
      case UserRole.SUPER_ADMIN:
        return "No puedes eliminar tu propia cuenta como Super Administrador";
      case UserRole.ADMIN:
        return "Eliminar cuenta";
      default:
        return "Eliminar mi cuenta";
    }
  };

  const handleDeleteAccount = () => {
    if (
      emailConfirmation.toLocaleLowerCase() !==
      session?.user?.email?.toLocaleLowerCase()
    ) {
      toast({
        variant: "destructive",
        description: "El correo electrónico no coincide",
      });
      return;
    }

    deleteAccount(
      { id: session?.user?.id as string },
      {
        onSettled: () => {
          setIsOpen(false);
          setEmailConfirmation("");
        },
      },
    );
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
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <IconAlertTriangle className="size-5" />
                  Confirmar eliminación de cuenta
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción es permanente y no se puede deshacer. Por favor,
                  escribe tu correo electrónico para confirmar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email-confirmation">
                    Escribe tu correo electrónico
                  </Label>
                  <Input
                    id="email-confirmation"
                    value={emailConfirmation}
                    onChange={(e) => setEmailConfirmation(e.target.value)}
                    placeholder={session?.user?.email as string}
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className=""
                  onClick={() => {
                    setEmailConfirmation("");
                    setIsOpen(false);
                  }}
                >
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDeleteAccount}
                    disabled={
                      emailConfirmation.toLocaleLowerCase() !==
                        session?.user?.email?.toLocaleLowerCase() ||
                      !canDeleteAccount(session?.user?.id as string)
                    }
                  >
                    Eliminar cuenta permanentemente
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
};
