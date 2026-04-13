import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";
import { getPagination } from "../middlewares/pagination.middleware";

export class CategoryController {
  private categoryService = new CategoryService();

  findAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pagination = getPagination(req.query as Record<string, string>);
      const result = await this.categoryService.findAll(pagination);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  findById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const category = await this.categoryService.findById(req.params.id);
      res.status(200).json(category);
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const category = await this.categoryService.create(req.body);
      res
        .status(201)
        .json({ message: "Categoria criada com sucesso.", category });
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const category = await this.categoryService.update(
        req.params.id,
        req.body,
      );
      res
        .status(200)
        .json({ message: "Categoria atualizada com sucesso.", category });
    } catch (err) {
      next(err);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.categoryService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
