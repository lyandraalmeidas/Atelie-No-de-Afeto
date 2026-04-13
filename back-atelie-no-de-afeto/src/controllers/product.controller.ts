import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { getPagination } from '../middlewares/pagination.middleware';

export class ProductController {
  private productService = new ProductService();

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = getPagination(req.query as Record<string, string>);
      const result = await this.productService.findAll(pagination);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.findById(req.params.id);
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.create(req.body);
      res.status(201).json({ message: 'Produto criado com sucesso.', product });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.update(req.params.id, req.body);
      res.status(200).json({ message: 'Produto atualizado com sucesso.', product });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.productService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}