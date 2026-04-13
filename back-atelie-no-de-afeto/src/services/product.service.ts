import { ProductRepository } from "../repositories/product.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { AppError } from "../utils/AppError";
import {
  CreateProductInput,
  UpdateProductInput,
  PaginationQuery,
} from "../types";

export class ProductService {
  private productRepository = new ProductRepository();
  private categoryRepository = new CategoryRepository();

  async findAll(pagination: PaginationQuery) {
    return this.productRepository.findAll(pagination);
  }

  async findById(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new AppError("Produto não encontrado.", 404);
    return product;
  }

  async create(input: CreateProductInput) {
    this.validateProductInput(input);
    await this.ensureCategoryExists(input.categoryId);
    return this.productRepository.create(input);
  }

  async update(id: string, input: UpdateProductInput) {
    this.validateProductInput(input);
    await this.ensureProductExists(id);
    await this.ensureCategoryExists(input.categoryId);
    return this.productRepository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new AppError("Produto não encontrado.", 404);
    if (product.orderItems.length > 0) {
      throw new AppError(
        "Não é possível excluir um produto que possui pedidos vinculados.",
        400,
      );
    }
    // remove imagem do servidor se for uma imagem local
    if (product.imageUrl?.includes("/uploads/")) {
      const fs = await import("fs");
      const path = await import("path");
      const filename = product.imageUrl.split("/uploads/").pop();
      if (filename) {
        const filePath = path.resolve("uploads", path.basename(filename));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }
    await this.productRepository.delete(id);
  }

  private validateProductInput(
    input: CreateProductInput | UpdateProductInput,
  ): void {
    if (!input.name?.trim())
      throw new AppError("Nome do produto é obrigatório.", 400);
    if (!input.description?.trim())
      throw new AppError("Descrição é obrigatória.", 400);
    if (input.price <= 0)
      throw new AppError("Preço deve ser maior que zero.", 400);
    if (input.stock < 0)
      throw new AppError("Estoque não pode ser negativo.", 400);
    if (!input.categoryId) throw new AppError("Categoria é obrigatória.", 400);
  }

  private async ensureProductExists(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new AppError("Produto não encontrado.", 404);
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new AppError("Categoria não encontrada.", 404);
  }
}
