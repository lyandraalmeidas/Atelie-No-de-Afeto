import { Request, Response, NextFunction } from 'express';
import { PaginationQuery } from '../types';

export const parsePagination = (req: Request, _res: Response, next: NextFunction): void => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  req.query.parsedPage = String(page);
  req.query.parsedLimit = String(limit);
  next();
};

export const getPagination = (query: Record<string, string>): PaginationQuery => ({
  page: Number(query.parsedPage) || 1,
  limit: Number(query.parsedLimit) || 10,
});