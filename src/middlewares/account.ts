import { NextFunction, Request, Response } from "express";
import { createAccountInputSchema } from "../schemas/account";
import { ZodError } from "zod";

export const validateAccountBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    createAccountInputSchema.parse(req.body);
    next();
  } catch (error) {
    const err = error as ZodError;
    res.status(400).json({ error: err.message });
  }
};
