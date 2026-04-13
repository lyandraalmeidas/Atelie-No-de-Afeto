import { CartRepository } from '../../../src/repositories/cart.repository';
import prisma from '../../../src/lib/prisma';

jest.mock('../../../src/lib/prisma', () => ({
  cart:     { findUnique: jest.fn(), create: jest.fn() },
  cartItem: { upsert: jest.fn(), updateMany: jest.fn(), deleteMany: jest.fn() },
}));

const prismaMock = prisma as jest.Mocked<typeof prisma>;

const makeCartItem = (productId = 'prod-1', quantity = 2) => ({
  id: `ci-${productId}`, cartId: 'cart-1', productId, quantity,
  product: { id: productId, name: 'Laço', price: 39.9, stock: 10, categoryId: 'cat-1' },
});

const makeCart = (items = [makeCartItem()]) => ({
  id: 'cart-1', userId: 'user-1', updatedAt: new Date(), items,
});

describe('CartRepository', () => {
  let repo: CartRepository;
  beforeEach(() => { repo = new CartRepository(); jest.clearAllMocks(); });

  describe('findOrCreate', () => {
    it('retorna carrinho existente sem criar um novo', async () => {
      (prismaMock.cart.findUnique as jest.Mock).mockResolvedValue(makeCart());
      const result = await repo.findOrCreate('user-1');
      expect(prismaMock.cart.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user-1' } }));
      expect(prismaMock.cart.create).not.toHaveBeenCalled();
      expect(result.id).toBe('cart-1');
    });

    it('cria novo carrinho quando não existe', async () => {
      (prismaMock.cart.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.cart.create as jest.Mock).mockResolvedValue(makeCart([]));
      const result = await repo.findOrCreate('user-1');
      expect(prismaMock.cart.create).toHaveBeenCalledWith(expect.objectContaining({ data: { userId: 'user-1' } }));
      expect(result.items).toHaveLength(0);
    });
  });

  describe('upsertItem', () => {
    it('faz upsert e retorna carrinho atualizado', async () => {
      const cart = makeCart([]);
      const updatedCart = makeCart([makeCartItem('prod-1', 1)]);
      (prismaMock.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce(cart)
        .mockResolvedValueOnce(updatedCart);
      (prismaMock.cartItem.upsert as jest.Mock).mockResolvedValue({});

      const result = await repo.upsertItem('user-1', 'prod-1', 1);

      expect(prismaMock.cartItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { cartId_productId: { cartId: 'cart-1', productId: 'prod-1' } },
          create: expect.objectContaining({ quantity: 1 }),
          update: { quantity: { increment: 1 } },
        })
      );
      expect(result!.items).toHaveLength(1);
    });

    it('incrementa quantidade de item existente', async () => {
      const cart = makeCart([makeCartItem('prod-1', 3)]);
      const updatedCart = makeCart([makeCartItem('prod-1', 4)]);
      (prismaMock.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce(cart)
        .mockResolvedValueOnce(updatedCart);
      (prismaMock.cartItem.upsert as jest.Mock).mockResolvedValue({});

      const result = await repo.upsertItem('user-1', 'prod-1', 1);
      expect(result!.items[0].quantity).toBe(4);
    });
  });

  describe('updateItemQuantity', () => {
    it('atualiza quantidade quando > 0', async () => {
      const cart = makeCart();
      const updated = makeCart([makeCartItem('prod-1', 5)]);
      (prismaMock.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce(cart)
        .mockResolvedValueOnce(updated);
      (prismaMock.cartItem.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await repo.updateItemQuantity('user-1', 'prod-1', 5);
      expect(prismaMock.cartItem.updateMany).toHaveBeenCalledWith({ where: { cartId: 'cart-1', productId: 'prod-1' }, data: { quantity: 5 } });
      expect(result!.items[0].quantity).toBe(5);
    });

    it('remove item quando quantidade é 0', async () => {
      const cart = makeCart();
      (prismaMock.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce(cart)
        .mockResolvedValueOnce(makeCart([]));
      (prismaMock.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await repo.updateItemQuantity('user-1', 'prod-1', 0);
      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart-1', productId: 'prod-1' } });
      expect(result!.items).toHaveLength(0);
    });

    it('retorna null quando carrinho não existe', async () => {
      (prismaMock.cart.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await repo.updateItemQuantity('user-x', 'prod-1', 3);
      expect(prismaMock.cartItem.updateMany).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('remove item específico do carrinho', async () => {
      (prismaMock.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce(makeCart())
        .mockResolvedValueOnce(makeCart([]));
      (prismaMock.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await repo.removeItem('user-1', 'prod-1');
      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart-1', productId: 'prod-1' } });
      expect(result!.items).toHaveLength(0);
    });

    it('retorna null quando carrinho não existe', async () => {
      (prismaMock.cart.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await repo.removeItem('user-x', 'prod-1');
      expect(prismaMock.cartItem.deleteMany).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('deleta todos os itens do carrinho', async () => {
      (prismaMock.cart.findUnique as jest.Mock).mockResolvedValue(makeCart());
      (prismaMock.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      await repo.clear('user-1');
      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart-1' } });
    });

    it('não chama deleteMany quando carrinho não existe', async () => {
      (prismaMock.cart.findUnique as jest.Mock).mockResolvedValue(null);
      await repo.clear('user-x');
      expect(prismaMock.cartItem.deleteMany).not.toHaveBeenCalled();
    });
  });
});