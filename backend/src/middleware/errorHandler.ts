import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";
import { AppError, unprocessable } from "../lib/errors.js";

type Part = "body" | "query" | "params";

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export function validate<T>(schema: ZodType<T>, part: Part = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[part]);
      if (part === "body") req.body = parsed;
      else if (part === "query") req.validatedQuery = parsed;
      else req.validatedParams = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(
          unprocessable("Validation failed", {
            issues: err.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          }),
        );
        return;
      }
      next(err);
    }
  };
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null,
      },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      details: null,
    },
  });
}
