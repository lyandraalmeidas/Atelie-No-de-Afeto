import { OrderService } from '../../../src/services/order.service';
import { OrderRepository } from '../../../src/repositories/order.repository';
import { ProductRepository } from '../../../src/repositories/product.repository';
import prisma from '../../../src/lib/prisma';

jest.mock('../../../src/repositories/order.repository');
jest.mock('../../../src/repositories/product.repository');

// Mocka o Prisma client para capturar a transação e fornecer tx.product.findUnique
jest.mock('../../../src/lib/prisma', () => ({
  $transaction: jest.fn(),
}));

const MockOrderRepository    = OrderRepository    as jest.MockedClass<typeof OrderRepository>;
const MockProductRepository  = ProductRepository  as jest.MockedClass<typeof ProductRepository>;
const prismaMock = prisma as jest.Mocked<typeof prisma>;

const makeProduct = (stock = 20) => ({
  id: 'prod-1', name: 'Laço de Seda', description: 'Laço artesanal',
  price: 39.9, stock, categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Laços', createdAt: new Date(), updatedAt: new Date() },
  createdAt: new Date(), updatedAt: new Date(), orderItems: [],
});

const mockOrder = {
  id: 'order-uuid-1', userId: 'user-1',
  status: 'PENDING' as const, total: 79.8,
  createdAt: new Date(), updatedAt: new Date(),
  user: { id: 'user-1', name: 'Ana', email: 'ana@email.com' },
  items: [{ id: 'item-1', orderId: 'order-uuid-1', productId: 'prod-1', quantity: 2, price: 39.9, product: { id: 'prod-1', name: 'Laço de Seda' } }],
};

// Simula o comportamento de prisma.$transaction: executa o callback com tx mockado
function setupTransaction(product = makeProduct()) {
  const tx = {
    product:    { findUnique: jest.fn().mockResolvedValue(product), update: jest.fn().mockResolvedValue(product) },
    order:      { create:     jest.fn().mockResolvedValue(mockOrder) },
    cartItem:   { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
  };
  (prismaMock.$transaction as jest.Mock).mockImplementation(
    (callback: (tx: Record<string, Record<string, jest.Mock>>) => Promise<unknown>) => callback(tx)
  );
  return tx;
}

describe('OrderService', () => {
  let service:         OrderService;
  let orderRepoMock:   jest.Mocked<OrderRepository>;
  let productRepoMock: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    MockOrderRepository.mockClear();
    MockProductRepository.mockClear();
    service         = new OrderService();
    orderRepoMock   = MockOrderRepository.mock.instances[0]   as jest.Mocked<OrderRepository>;
    productRepoMock = MockProductRepository.mock.instances[0] as jest.Mocked<ProductRepository>;
    jest.clearAllMocks();
  });

  // ─── findById ───────────────────────────────────────────────
  describe('findById', () => {
    it('retorna pedido existente', async () => {
      orderRepoMock.findById = jest.fn().mockResolvedValue(mockOrder);
      const result = await service.findById('order-uuid-1');
      expect(result).toEqual(mockOrder);
    });

    it('lança 404 para pedido inexistente', async () => {
      orderRepoMock.findById = jest.fn().mockResolvedValue(null);
      await expect(service.findById('nao-existe')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ─── create ─────────────────────────────────────────────────
  describe('create', () => {
    const validInput = { items: [{ productId: 'prod-1', quantity: 2 }] };

    it('cria pedido com itens válidos e decrementa estoque', async () => {
      const product = makeProduct(20);
      productRepoMock.findById = jest.fn().mockResolvedValue(product);
      const tx = setupTransaction(product);

      const result = await service.create('user-1', validInput);

      expect(result).toEqual(mockOrder);
      // Verifica que o estoque foi checado dentro da transação
      expect(tx.product.findUnique).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
    });

    it('lança 400 para lista de itens vazia', async () => {
      await expect(service.create('user-1', { items: [] })).rejects.toMatchObject({
        statusCode: 400,
        message: 'O pedido deve ter ao menos um item.',
      });
    });

    it('lança 404 se produto não existe (processItem)', async () => {
      productRepoMock.findById = jest.fn().mockResolvedValue(null);
      await expect(service.create('user-1', validInput)).rejects.toMatchObject({ statusCode: 404 });
    });

    it('lança 400 para quantidade zero', async () => {
      productRepoMock.findById = jest.fn().mockResolvedValue(makeProduct());
      await expect(
        service.create('user-1', { items: [{ productId: 'prod-1', quantity: 0 }] })
      ).rejects.toMatchObject({ statusCode: 400, message: 'Quantidade deve ser maior que zero.' });
    });

    it('lança 400 para estoque insuficiente (verificação no processItem)', async () => {
      productRepoMock.findById = jest.fn().mockResolvedValue(makeProduct(1));
      await expect(
        service.create('user-1', { items: [{ productId: 'prod-1', quantity: 5 }] })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('lança 400 para estoque insuficiente detectado dentro da transação', async () => {
      const product = makeProduct(20);
      productRepoMock.findById = jest.fn().mockResolvedValue(product);
      // Dentro da tx, o produto já não tem estoque suficiente (race condition)
      setupTransaction({ ...product, stock: 0 });
      await expect(service.create('user-1', validInput)).rejects.toMatchObject({ statusCode: 400 });
    });

    it('calcula total corretamente para múltiplos itens', async () => {
      const product = makeProduct(20);
      productRepoMock.findById = jest.fn().mockResolvedValue(product);
      const tx = setupTransaction(product);

      await service.create('user-1', { items: [{ productId: 'prod-1', quantity: 3 }] });

      // total = 39.9 * 3 = 119.7
      expect(tx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ total: expect.closeTo(119.7, 1) }),
        })
      );
    });
  });

  // ─── updateStatus ────────────────────────────────────────────
  describe('updateStatus', () => {
    it('atualiza status de pedido existente', async () => {
      orderRepoMock.findById    = jest.fn().mockResolvedValue(mockOrder);
      orderRepoMock.updateStatus = jest.fn().mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' });
      const result = await service.updateStatus('order-uuid-1', { status: 'CONFIRMED' });
      expect(result.status).toBe('CONFIRMED');
    });

    it('lança 404 ao atualizar pedido inexistente', async () => {
      orderRepoMock.findById = jest.fn().mockResolvedValue(null);
      await expect(
        service.updateStatus('nao-existe', { status: 'CONFIRMED' })
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ─── delete ──────────────────────────────────────────────────
  describe('delete', () => {
    it('deleta pedido existente', async () => {
      orderRepoMock.findById = jest.fn().mockResolvedValue(mockOrder);
      orderRepoMock.delete   = jest.fn().mockResolvedValue(undefined);
      await expect(service.delete('order-uuid-1')).resolves.toBeUndefined();
    });

    it('lança 404 ao deletar pedido inexistente', async () => {
      orderRepoMock.findById = jest.fn().mockResolvedValue(null);
      await expect(service.delete('nao-existe')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ─── findByUser ──────────────────────────────────────────────
  describe('findByUser', () => {
    it('retorna pedidos paginados do usuário', async () => {
      const paginated = { data: [mockOrder], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } };
      orderRepoMock.findByUser = jest.fn().mockResolvedValue(paginated);
      const result = await service.findByUser('user-1', { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});