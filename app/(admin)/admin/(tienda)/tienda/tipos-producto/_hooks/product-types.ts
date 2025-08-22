import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createProductType,
  deleteProductTypes,
  updateProductType,
} from "../_lib/actions";

export function useCreateProductType() {
  return useMutation({
    mutationFn: createProductType,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateProductType() {
  return useMutation({
    mutationFn: updateProductType,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteProductTypes() {
  return useMutation({
    mutationFn: deleteProductTypes,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}