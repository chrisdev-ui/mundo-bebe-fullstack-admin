import { z } from "zod";

import { userSelect } from "@/server/schemas";

export type User = z.infer<typeof userSelect>;

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};
