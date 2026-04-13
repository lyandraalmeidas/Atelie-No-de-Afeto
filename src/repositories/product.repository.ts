import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { PaginationQuery, PaginatedResult, CreateProductInput, UpdateProductInput } from '../types';

type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;

export class ProductRepository {
  async findById(id: string) {
    return prisma.product.findUnique({ where: { id }, include: { category: true } });
  }

  async create(data: CreateProductInput) {
    return prisma.product.create({ data, include: { category: true } });
  }

  async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({ where: { id }, data, include: { category: true } });
  }

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  async findAll(pagination: PaginationQuery): Promise<PaginatedResult<ProductWithCategory>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.product.findMany({ skip, take: limit, include: { category: true }, orderBy: { createdAt: 'desc' } }),
      prisma.product.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}