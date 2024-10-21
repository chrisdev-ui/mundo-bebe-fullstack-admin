import { z } from "zod";

export const adminInvitationSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

export const searchCodeSchema = z.object({
  code: z.string(),
  email: z.string().email(),
});
