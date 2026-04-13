import { Request, Response, NextFunction } from "express";
import { CartService } from "../services/cart.service";

const cartService = new CartService();

export class CartController {
  async getCart(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const carrinho = await cartService.getCart(req.userId);
      res.json(carrinho);
    } catch (e) {
      next(e);
    }
  }

  async addItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { productId, quantity = 1 } = req.body;
      const carrinho = await cartService.addItem(
        req.userId,
        productId,
        Number(quantity),
      );
      res.status(200).json(carrinho);
    } catch (e) {
      next(e);
    }
  }

  async updateItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { produtoId } = req.params;
      const { quantity } = req.body;
      const carrinho = await cartService.updateItem(
        req.userId,
        produtoId,
        Number(quantity),
      );
      res.json(carrinho);
    } catch (e) {
      next(e);
    }
  }

  async removeItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const carrinho = await cartService.removeItem(
        req.userId,
        req.params.produtoId,
      );
      res.json(carrinho);
    } catch (e) {
      next(e);
    }
  }

  async clearCart(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await cartService.clear(req.userId);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
}
