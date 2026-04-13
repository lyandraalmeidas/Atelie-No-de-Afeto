import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

//autenticação do role ADMIN
export const authorizeAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.userRole !== 'ADMIN') {
    throw new AppError('Acesso restrito a administradores.', 403);
  }
  next();
};