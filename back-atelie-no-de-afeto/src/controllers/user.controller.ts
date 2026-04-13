import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { getPagination } from "../middlewares/pagination.middleware";
import { UpdateUserInput } from "../types";

export class UserController {
  private userService = new UserService();

  findAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pagination = getPagination(req.query as Record<string, string>);
      const result = await this.userService.findAll(pagination);
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
      const user = await this.userService.findById(req.params.id);
      res.status(200).json(user);
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
      // Extrai apenas os campos permitidos — e-mail não pode ser alterado
      const { name, cpf, phone, password, confirmPassword } =
        req.body as UpdateUserInput;
      const user = await this.userService.update(req.userId, req.params.id, {
        name,
        cpf,
        phone,
        password,
        confirmPassword,
      });
      res
        .status(200)
        .json({ message: "Usuário atualizado com sucesso.", user });
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
      await this.userService.delete(req.userId, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
