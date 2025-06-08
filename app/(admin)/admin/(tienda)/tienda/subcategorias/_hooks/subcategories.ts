import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createSubcategory,
  deleteSubcategories,
  updateSubcategory,
} from "../_lib/actions";

export function useCreateSubcategory() {
  return useMutation({
    mutationFn: createSubcategory,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSubcategory() {
  return useMutation({
    mutationFn: updateSubcategory,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteSubcategories() {
  return useMutation({
    mutationFn: deleteSubcategories,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
