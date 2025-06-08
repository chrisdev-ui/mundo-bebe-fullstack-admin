import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createCategory,
  deleteCategories,
  updateCategory,
} from "../_lib/actions";

export function useCreateCategory() {
  return useMutation({
    mutationFn: createCategory,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCategory() {
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCategories() {
  return useMutation({
    mutationFn: deleteCategories,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
