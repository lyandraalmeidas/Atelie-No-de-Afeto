import { Prisma } from "@prisma/client";
import { CategoryRepository } from "../repositories/category.repository";
import { AppError } from "../utils/AppError";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  PaginationQuery,
} from "../types";

type CategoryWithProducts = Prisma.CategoryGetPayload<{
  include: { products: true };
}>;
type CategoryBase = Prisma.CategoryGetPayload<Record<string, never>>;

export class CategoryService {
  private categoryRepository = new CategoryRepository();

  async findAll(pagination: PaginationQuery) {
    return this.categoryRepository.findAll(pagination);
  }

  async findById(id: string): Promise<CategoryWithProducts> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new AppError("Categoria não encontrada.", 404);
    return category;
  }

  async create(input: CreateCategoryInput): Promise<CategoryBase> {
    if (!input.name?.trim())
      throw new AppError("Nome da categoria é obrigatório.", 400);
    await this.ensureNameAvailable(input.name);
    return this.categoryRepository.create(input);
  }

  async update(id: string, input: UpdateCategoryInput): Promise<CategoryBase> {
    if (!input.name?.trim())
      throw new AppError("Nome da categoria é obrigatório.", 400);
    await this.ensureCategoryExists(id);
    await this.ensureNameAvailableForUpdate(input.name, id);
    return this.categoryRepository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new AppError("Categoria não encontrada.", 404);

    // avisa que se houver produtos viculados, não é possível excluir a categoria
    if (category.products.length > 0) {
      throw new AppError(
        "Não é possível excluir uma categoria com produtos vinculados.",
        400,
      );
    }

    await this.categoryRepository.delete(id);
  }

  private async ensureCategoryExists(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new AppError("Categoria não encontrada.", 404);
  }

  private async ensureNameAvailable(name: string): Promise<void> {
    const existing = await this.categoryRepository.findByName(name);
    if (existing)
      throw new AppError("Já existe uma categoria com esse nome.", 409);
  }

  private async ensureNameAvailableForUpdate(
    name: string,
    id: string,
  ): Promise<void> {
    const existing = await this.categoryRepository.findByName(name);
    if (existing && existing.id !== id)
      throw new AppError("Já existe uma categoria com esse nome.", 409);
  }
}
