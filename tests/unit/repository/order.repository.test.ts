import { OrderRepository } from '../../../src/repositories/order.repository';
import { Prisma } from '@prisma/client';
import prisma from '../../../src/lib/prisma';

jest.mock('../../../src/lib/prisma', () => ({
  order: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

const prismaMock = prisma as jest.Mocked<typeof prisma>;

const mockOrder = {
  id: 'order-1', userId: 'user-1', status: 'PENDING', total: 39.9,
  createdAt: new Date(), updatedAt: new Date(),
  user: { id: 'user-1', name: 'Ana', email: 'ana@email.com' },
  items: [],
};

describe('OrderRepository', () => {
  let repo: OrderRepository;
  beforeEach(() => { repo = new OrderRepository(); jest.clearAllMocks(); });

  it('findById retorna pedido com user e items', async () => {
    (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    await repo.findById('order-1');
    expect(prismaMock.order.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'order-1' } }));
  });

  it('create cria pedido com items aninhados', async () => {
    (prismaMock.order.create as jest.Mock).mockResolvedValue(mockOrder);
    const items: Prisma.OrderItemCreateWithoutOrderInput[] = [
      { product: { connect: { id: 'prod-1' } }, quantity: 2, price: 39.9 },
    ];
    await repo.create('user-1', 79.8, items);
    expect(prismaMock.order.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: 'user-1', items: { create: items } }),
    }));
  });

  it('updateStatus atualiza status do pedido', async () => {
    (prismaMock.order.update as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' });
    await repo.updateStatus('order-1', { status: 'CONFIRMED' });
    expect(prismaMock.order.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'order-1' }, data: { status: 'CONFIRMED' },
    }));
  });

  it('delete remove pedido', async () => {
    (prismaMock.order.delete as jest.Mock).mockResolvedValue(mockOrder);
    await repo.delete('order-1');
    expect(prismaMock.order.delete).toHaveBeenCalledWith({ where: { id: 'order-1' } });
  });

  it('findAll retorna resultado paginado', async () => {
    (prismaMock.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
    (prismaMock.order.count as jest.Mock).mockResolvedValue(1);
    const result = await repo.findAll({ page: 1, limit: 10 });
    expect(result.meta.total).toBe(1);
  });

  it('findByUser filtra por userId e pagina', async () => {
    (prismaMock.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
    (prismaMock.order.count as jest.Mock).mockResolvedValue(1);
    await repo.findByUser('user-1', { page: 1, limit: 10 });
    expect(prismaMock.order.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user-1' } }));
    expect(prismaMock.order.count).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });
});