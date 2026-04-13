import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import {
  PaginationQuery,
  PaginatedResult,
  UpdateOrderStatusInput,
} from "../types";

type OrderItemCreateData = Prisma.OrderItemCreateWithoutOrderInput;
type OrderWithDetails = Prisma.OrderGetPayload<typeof orderQuery>;

const orderQuery = {
  include: {
    user: { select: { id: true, name: true, email: true } },
    items: { include: { product: { select: { id: true, name: true } } } },
  },
} as const;

export class OrderRepository {
  async findById(id: string) {
    return prisma.order.findUnique({ where: { id }, ...orderQuery });
  }

  async create(
    userId: string,
    total: number,
    itemsData: OrderItemCreateData[],
  ) {
    return prisma.order.create({
      data: { userId, total, items: { create: itemsData } },
      ...orderQuery,
    });
  }

  async updateStatus(id: string, data: UpdateOrderStatusInput) {
    return prisma.order.update({ where: { id }, data, ...orderQuery });
  }

  async delete(id: string) {
    return prisma.order.delete({ where: { id } });
  }

  async findAll(
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<OrderWithDetails>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        ...orderQuery,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count(),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUser(
    userId: string,
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<OrderWithDetails>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        ...orderQuery,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where: { userId } }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
