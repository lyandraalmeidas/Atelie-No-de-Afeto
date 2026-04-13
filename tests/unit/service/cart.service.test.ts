import { CartService } from '../../../src/services/cart.service';
import { CartRepository } from '../../../src/repositories/cart.repository';
import { ProductRepository } from '../../../src/repositories/product.repository';
import { Decimal } from '@prisma/client/runtime/library';

jest.mock('../../../src/repositories/cart.repository');
jest.mock('../../../src/repositories/product.repository');

const MockCartRepo    = CartRepository    as jest.MockedClass<typeof CartRepository>;
const MockProductRepo = ProductRepository as jest.MockedClass<typeof ProductRepository>;

const makeProduct = (stock = 10) => ({
  id: 'prod-1', name: 'Laço', description: 'Desc',
  price: new Decimal(39.9), stock, categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Laços', createdAt: new Date(), updatedAt: new Date() },
  createdAt: new Date(), updatedAt: new Date(), orderItems: [],
});

const makeCart = (items: { productId: string; quantity: number }[] = []) => ({
  id: 'cart-1', userId: 'user-1', updatedAt: new Date(),
  items: items.map((i) => ({
    id: `ci-${i.productId}`, cartId: 'cart-1', ...i, product: makeProduct(10),
  })),
});

describe('CartService', () => {
  let service:     CartService;
  let cartRepo:    jest.Mocked<CartRepository>;
  let productRepo: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    service     = new CartService();
    cartRepo    = MockCartRepo.mock.instances[0]    as jest.Mocked<CartRepository>;
    productRepo = MockProductRepo.mock.instances[0] as jest.Mocked<ProductRepository>;
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('chama findOrCreate e retorna o carrinho', async () => {
      cartRepo.findOrCreate.mockResolvedValue(makeCart());
      const result = await service.getCart('user-1');
      expect(cartRepo.findOrCreate).toHaveBeenCalledWith('user-1');
      expect(result.items).toHaveLength(0);
    });
  });

  describe('addItem', () => {
    it('adiciona item quando produto tem estoque', async () => {
      productRepo.findById.mockResolvedValue(makeProduct(10));
      cartRepo.findOrCreate.mockResolvedValue(makeCart());
      cartRepo.upsertItem.mockResolvedValue(makeCart([{ productId: 'prod-1', quantity: 2 }]));
      const result = await service.addItem('user-1', 'prod-1', 2);
      expect(cartRepo.upsertItem).toHaveBeenCalledWith('user-1', 'prod-1', 2);
      // result from upsertItem can be null per type — assert non-null
      expect(result!.items).toHaveLength(1);
      expect(result!.items[0].quantity).toBe(2);
    });

    it('lança AppError 400 para quantidade zero', async () => {
      await expect(service.addItem('user-1', 'prod-1', 0))
        .rejects.toMatchObject({ statusCode: 400 });
    });

    it('lança AppError 400 para quantidade negativa', async () => {
      await expect(service.addItem('user-1', 'prod-1', -1))
        .rejects.toMatchObject({ statusCode: 400 });
    });

    it('lança AppError 404 quando produto não existe', async () => {
      productRepo.findById.mockResolvedValue(null);
      await expect(service.addItem('user-1', 'prod-1', 1))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it('lança AppError 400 quando produto está esgotado', async () => {
      productRepo.findById.mockResolvedValue(makeProduct(0));
      cartRepo.findOrCreate.mockResolvedValue(makeCart());
      await expect(service.addItem('user-1', 'prod-1', 1))
        .rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('esgotado') });
    });

    it('lança AppError 400 quando quantidade excede estoque disponível', async () => {
      productRepo.findById.mockResolvedValue(makeProduct(3));
      cartRepo.findOrCreate.mockResolvedValue(makeCart());
      await expect(service.addItem('user-1', 'prod-1', 5))
        .rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('insuficiente') });
    });

    it('lança AppError 400 quando soma com itens existentes excede estoque', async () => {
      productRepo.findById.mockResolvedValue(makeProduct(5));
      cartRepo.findOrCreate.mockResolvedValue(makeCart([{ productId: 'prod-1', quantity: 4 }]));
      await expect(service.addItem('user-1', 'prod-1', 2))
        .rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('insuficiente') });
    });

    it('aceita quantidade exatamente igual ao estoque disponível', async () => {
      productRepo.findById.mockResolvedValue(makeProduct(5));
      cartRepo.findOrCreate.mockResolvedValue(makeCart());
      cartRepo.upsertItem.mockResolvedValue(makeCart([{ productId: 'prod-1', quantity: 5 }]));
      const result = await service.addItem('user-1', 'prod-1', 5);
      expect(result!.items[0].quantity).toBe(5);
    });
  });

  describe('updateItem', () => {
    it('atualiza quantidade quando dentro do estoque', async () => {
      productRepo.findById.mockResolvedValue(makeProduct(10));
      cartRepo.updateItemQuantity.mockResolvedValue(makeCart([{ productId: 'prod-1', quantity: 3 }]));
      const result = await service.updateItem('user-1', 'prod-1', 3);
      expect(cartRepo.updateItemQuantity).toHaveBeenCalledWith('user-1', 'prod-1', 3);
      expect(result!.items[0].quantity).toBe(3);
    });

    it('remove item quando quantidade é 0', async () => {
      cartRepo.removeItem.mockResolvedValue(makeCart());
      await service.updateItem('user-1', 'prod-1', 0);
      expect(cartRepo.removeItem).toHaveBeenCalledWith('user-1', 'prod-1');
      expect(cartRepo.updateItemQuantity).not.toHaveBeenCalled();
    });

    it('lança AppError 400 para quantidade negativa', async () => {
      await expect(service.updateItem('user-1', 'prod-1', -1))
        .rejects.toMatchObject({ statusCode: 400 });
    });

    it('lança AppError 404 quando produto não existe', async () => {
      productRepo.findById.mockResolvedValue(null);
      await expect(service.updateItem('user-1', 'prod-1', 2))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it('lança AppError 400 quando nova quantidade excede estoque', async () => {
      productRepo.findById.mockResolvedValue(makeProduct(2));
      await expect(service.updateItem('user-1', 'prod-1', 5))
        .rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('insuficiente') });
    });
  });

  describe('removeItem', () => {
    it('remove item e retorna carrinho atualizado', async () => {
      cartRepo.removeItem.mockResolvedValue(makeCart());
      await service.removeItem('user-1', 'prod-1');
      expect(cartRepo.removeItem).toHaveBeenCalledWith('user-1', 'prod-1');
    });
  });

  describe('clear', () => {
    it('limpa todos os itens do carrinho', async () => {
      cartRepo.clear.mockResolvedValue(undefined);
      await service.clear('user-1');
      expect(cartRepo.clear).toHaveBeenCalledWith('user-1');
    });
  });
});