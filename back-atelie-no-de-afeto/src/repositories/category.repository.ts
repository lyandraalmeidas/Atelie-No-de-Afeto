import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import {
  PaginationQuery,
  PaginatedResult,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types";

type CategoryWithProducts = Prisma.CategoryGetPayload<{
  include: { products: true };
}>;
type CategoryBase = Prisma.CategoryGetPayload<Record<string, never>>;

export class CategoryRepository {
  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
  }

  async findByName(name: string) {
    return prisma.category.findUnique({ where: { name } });
  }

  async create(data: CreateCategoryInput) {
    return prisma.category.create({ data });
  }

  async update(id: string, data: UpdateCategoryInput) {
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  }

  async findAll(
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<CategoryBase>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.category.findMany({ skip, take: limit, orderBy: { name: "asc" } }),
      prisma.category.count(),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
