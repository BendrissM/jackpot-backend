import { NextFunction, Request, Response } from "express";
import { SessionIdSchema, createSessionInputSchema } from "../schemas/session";
import { ZodError } from "zod";

export const validateSessionBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    createSessionInputSchema.parse(req.body);
    next();
  } catch (error) {
    const err = error as ZodError;
    res.status(400).json({ error: err.message });
  }
};

export const validateSessionId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    SessionIdSchema.parse(req.body);
    next();
  } catch (error) {
    const err = error as ZodError;
    res.status(400).json({ error: err.message });
  }
};
