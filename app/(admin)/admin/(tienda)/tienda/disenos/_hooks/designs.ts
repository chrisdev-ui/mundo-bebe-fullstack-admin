import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { createDesign, deleteDesigns, updateDesign } from "../_lib/actions";

export function useCreateDesign() {
  return useMutation({
    mutationFn: createDesign,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateDesign() {
  return useMutation({
    mutationFn: updateDesign,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteDesigns() {
  return useMutation({
    mutationFn: deleteDesigns,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
