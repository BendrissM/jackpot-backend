import { z } from "zod";

export const accountSchema = z.object({
  id: z.string(),
  balance: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createAccountInputSchema = accountSchema.partial();
