import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { createColor, deleteColors, updateColor } from "../_lib/actions";

export function useCreateColor() {
  return useMutation({
    mutationFn: createColor,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateColor() {
  return useMutation({
    mutationFn: updateColor,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteColors() {
  return useMutation({
    mutationFn: deleteColors,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
