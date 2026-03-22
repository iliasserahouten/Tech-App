import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app-error";

type JwtPayload = { sub: string; email: string };


export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid Authorization header", 401));
  }

  const token = header.slice("Bearer ".length).trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) return next(new AppError("JWT_SECRET is not configured", 500));

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;

    // sub = userId
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
}
