import prisma from '../lib/prisma';

const cartInclude = {
  include: {
    items: {
      include: {
        product: {
          select: { id: true, name: true, price: true, stock: true, categoryId: true },
        },
      },
    },
  },
} as const;

export class CartRepository {
  // puxa o carrinho existente ou cria um novo vazio
  async findOrCreate(userId: string) {
    const existing = await prisma.cart.findUnique({ where: { userId }, ...cartInclude });
    if (existing) return existing;
    return prisma.cart.create({ data: { userId }, ...cartInclude });
  }

  // bota item novo ou incrementa quantidade se já existe
  async upsertItem(userId: string, productId: string, quantity: number) {
    const cart = await this.findOrCreate(userId);
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
    return prisma.cart.findUnique({ where: { userId }, ...cartInclude });
  }

  // atualiza quantidade ou remove se for zero
  async updateItemQuantity(userId: string, productId: string, quantity: number) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return null;
    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    } else {
      await prisma.cartItem.updateMany({
        where: { cartId: cart.id, productId },
        data: { quantity },
      });
    }
    return prisma.cart.findUnique({ where: { userId }, ...cartInclude });
  }

  async removeItem(userId: string, productId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return null;
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    return prisma.cart.findUnique({ where: { userId }, ...cartInclude });
  }

  // remove tudo (usado quando finaliza a compra)
  async clear(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}