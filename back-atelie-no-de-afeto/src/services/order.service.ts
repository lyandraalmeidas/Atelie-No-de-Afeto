import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { AppError } from '../utils/AppError';
import { CreateOrderInput, UpdateOrderStatusInput, PaginationQuery, OrderItemInput } from '../types';

type OrderItemCreateData = Prisma.OrderItemCreateWithoutOrderInput;
type PricedItem = OrderItemCreateData & { subtotal: number; productId: string; quantity: number };

export class OrderService {
  private orderRepository = new OrderRepository();
  private productRepository = new ProductRepository();

  async findAll(pagination: PaginationQuery) {
    return this.orderRepository.findAll(pagination);
  }

  async findById(id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new AppError('Pedido não encontrado.', 404);
    return order;
  }

  async findByUser(userId: string, pagination: PaginationQuery) {
    return this.orderRepository.findByUser(userId, pagination);
  }

  async create(userId: string, input: CreateOrderInput) {
    if (!input.items?.length) throw new AppError('O pedido deve ter ao menos um item.', 400);

    const priced = await this.buildOrderItems(input);
    const total = priced.reduce((sum, { subtotal }) => sum + subtotal, 0);
    const itemsData = priced.map(({ subtotal: _s, productId: _p, ...rest }) => rest);

    // cria o pedido e decrementa o estoque
    return prisma.$transaction(async (tx) => {
      for (const { productId, quantity } of priced) {
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) throw new AppError(`Produto não encontrado.`, 404);
        if (product.stock < quantity) {
          throw new AppError(
            `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}.`,
            400
          );
        }
      }

      const order = await tx.order.create({
        data: { userId, total, items: { create: itemsData } },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: { select: { id: true, name: true } } } },
        },
      });

      await Promise.all(
        priced.map(({ productId, quantity }) =>
          tx.product.update({
            where: { id: productId },
            data: { stock: { decrement: quantity } },
          })
        )
      );

      return order;
    });
  }

  async updateStatus(id: string, input: UpdateOrderStatusInput) {
    await this.ensureOrderExists(id);
    return this.orderRepository.updateStatus(id, input);
  }

  async delete(id: string): Promise<void> {
    await this.ensureOrderExists(id);
    await this.orderRepository.delete(id);
  }

  private async ensureOrderExists(id: string): Promise<void> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new AppError('Pedido não encontrado.', 404);
  }

  private async processItem(item: OrderItemInput): Promise<PricedItem> {
    if (item.quantity <= 0) throw new AppError('Quantidade deve ser maior que zero.', 400);
    const product = await this.productRepository.findById(item.productId);
    if (!product) throw new AppError(`Produto ${item.productId} não encontrado.`, 404);
    // valida o estoque antes de montar o pedido
    if (product.stock < item.quantity) {
      throw new AppError(
        `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}.`,
        400
      );
    }
    if (product.stock === 0) {
      throw new AppError(`"${product.name}" está esgotado.`, 400);
    }
    const price = Number(product.price);
    return {
      product: { connect: { id: item.productId } },
      quantity: item.quantity,
      price,
      subtotal: price * item.quantity,
      productId: item.productId,
    };
  }

  private async buildOrderItems(input: CreateOrderInput): Promise<PricedItem[]> {
    return Promise.all(input.items.map((item) => this.processItem(item)));
  }
}