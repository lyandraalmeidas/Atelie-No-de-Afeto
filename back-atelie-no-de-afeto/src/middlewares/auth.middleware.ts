import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Token de autenticação não fornecido.", 401);
  }
  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  req.userId = payload.userId;
  req.userEmail = payload.email;
  req.userRole = payload.role;
  next();
};
