import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

type ErrorWithStatus = Error & { statusCode?: number };

const isKnownHttpError = (err: ErrorWithStatus): boolean =>
  typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600;

export const errorHandler = (
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError || isKnownHttpError(err)) {
    res.status(err.statusCode!).json({ message: err.message });
    return;
  }

  if (err instanceof TokenExpiredError) {
    res.status(401).json({ message: 'Token expirado. Faça login novamente.' });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({ message: 'Token inválido.' });
    return;
  }

  console.error('[Erro interno]', err);
  res.status(500).json({ message: 'Erro interno do servidor.' });
};