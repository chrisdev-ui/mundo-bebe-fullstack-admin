"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/server/client";
import { inviteAdminSchema as formSchema } from "@/types/schemas";

export const InviteAdminForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const { mutate: createInvitation, isPending } =
    trpc.invitations.create.useMutation({
      onSuccess: () => {
        toast({
          description: "Invitación enviada exitosamente",
          variant: "success",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          description: error.message,
        });
      },
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "paufermr@gmail.com",
      name: "Paula Morales",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createInvitation(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
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
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          size="xl"
          type="submit"
          className="w-full"
          disabled={isPending}
          aria-disabled={isPending}
        >
          Enviar invitación
        </Button>
      </form>
    </Form>
  );
};
