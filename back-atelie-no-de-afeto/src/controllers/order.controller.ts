import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { getPagination } from "../middlewares/pagination.middleware";

export class OrderController {
  private orderService = new OrderService();

  findAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pagination = getPagination(req.query as Record<string, string>);
      const result = await this.orderService.findAll(pagination);
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
      const order = await this.orderService.findById(req.params.id);
      res.status(200).json(order);
    } catch (err) {
      next(err);
    }
  };

  findByUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pagination = getPagination(req.query as Record<string, string>);
      const result = await this.orderService.findByUser(req.userId, pagination);
      res.status(200).json(result);
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
      const order = await this.orderService.create(req.userId, req.body);
      res.status(201).json({ message: "Pedido criado com sucesso.", order });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const order = await this.orderService.updateStatus(
        req.params.id,
        req.body,
      );
      res
        .status(200)
        .json({ message: "Status atualizado com sucesso.", order });
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
      await this.orderService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
