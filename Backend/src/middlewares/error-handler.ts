import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Known AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details ?? null,
      },
    });
  }

  // Prisma unique constraint (P2002)
  if (typeof err === "object" && err !== null && "code" in err && (err as any).code === "P2002") {
    return res.status(409).json({
      error: {
        message: "Resource already exists (unique constraint).",
        details: (err as any).meta ?? null,
      },
    });
  }

  // Fallback
  console.error(err);
  return res.status(500).json({
    error: {
      message: "Internal server error",
    },
  });
}
