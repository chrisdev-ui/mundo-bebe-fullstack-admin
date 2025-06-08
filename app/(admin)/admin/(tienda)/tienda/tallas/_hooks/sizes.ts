import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { createSize, deleteSizes, updateSize } from "../_lib/actions";

export function useCreateSize() {
  return useMutation({
    mutationFn: createSize,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSize() {
  return useMutation({
    mutationFn: updateSize,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteSizes() {
  return useMutation({
    mutationFn: deleteSizes,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
