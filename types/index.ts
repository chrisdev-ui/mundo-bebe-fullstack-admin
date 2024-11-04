import { z } from "zod";

import { MODULES } from "@/constants";
import { authUserSelect, userSelect } from "@/server/schemas";

export type User = z.infer<typeof userSelect>;

export type AuthUser = z.infer<typeof authUserSelect>;

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export type LoadingState = {
  isLoading: boolean;
  text: string;
};

export type AccessModules = (typeof MODULES)[number];
