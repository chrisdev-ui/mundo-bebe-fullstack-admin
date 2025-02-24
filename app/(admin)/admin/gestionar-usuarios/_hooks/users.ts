import { useMutation } from "@tanstack/react-query";
import { PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";

import { createUser, deleteUsers, updateUser } from "../_lib/actions";
import { CreateUserSchema, UpdateUserActionSchema } from "../_lib/validations";

export function useCreateUser() {
  return useMutation({
    mutationFn: async (data: CreateUserSchema) => {
      let blob: PutBlobResult | null = null;

      if (data.image instanceof File) {
        try {
          blob = await upload(data.image.name, data.image, {
            access: "public",
            handleUploadUrl: "/api/avatar/upload",
          });
        } catch (error) {
          console.error("Ha ocurrido un error al subir la imagen", error);
        }
      }

      return createUser({
        ...data,
        image: blob?.url ?? (data.image as string),
      });
    },
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: async (data: UpdateUserActionSchema) => {
      let blob: PutBlobResult | null = null;

      if (data.image instanceof File) {
        try {
          blob = await upload(data.image.name, data.image, {
            access: "public",
            handleUploadUrl: "/api/avatar/upload",
          });
        } catch (error) {
          console.error("Ha ocurrido un error al subir la imagen", error);
        }
      }

      return updateUser({
        ...data,
        image: blob?.url ?? (data.image as string),
      });
    },
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteUsers() {
  return useMutation({
    mutationFn: deleteUsers,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
