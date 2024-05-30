import { z } from "zod";
import { SessionStates } from "../types/session";

export const SessionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  credit: z.number(),
  state: z.enum([SessionStates.OPEN, SessionStates.CLOSED]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createSessionInputSchema = SessionSchema.pick({ accountId: true });

export const SessionIdSchema = z.object({
  sessionId: z.string(),
});
