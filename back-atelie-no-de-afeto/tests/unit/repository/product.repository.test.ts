import { ProductRepository } from '../../../src/repositories/product.repository';
import prisma from '../../../src/lib/prisma';

jest.mock('../../../src/lib/prisma', () => ({
  product: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

const prismaMock = prisma as jest.Mocked<typeof prisma>;

const mockCategory = { id: 'cat-1', name: 'Laços', createdAt: new Date(), updatedAt: new Date() };
const mockProduct = { id: 'prod-1', name: 'Laço', description: 'Desc', price: 39.9, stock: 10, categoryId: 'cat-1', category: mockCategory, createdAt: new Date(), updatedAt: new Date() };

describe('ProductRepository', () => {
  let repo: ProductRepository;
  beforeEach(() => { repo = new ProductRepository(); jest.clearAllMocks(); });

  it('findById retorna produto com categoria', async () => {
    (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
    await repo.findById('prod-1');
    expect(prismaMock.product.findUnique).toHaveBeenCalledWith({ where: { id: 'prod-1' }, include: { category: true } });
  });

  it('create cria produto com categoria incluída', async () => {
    (prismaMock.product.create as jest.Mock).mockResolvedValue(mockProduct);
    const data = { name: 'Laço', description: 'Desc', price: 39.9, stock: 10, categoryId: 'cat-1' };
    await repo.create(data);
    expect(prismaMock.product.create).toHaveBeenCalledWith({ data, include: { category: true } });
  });

  it('update atualiza produto', async () => {
    (prismaMock.product.update as jest.Mock).mockResolvedValue(mockProduct);
    const data = { name: 'Novo', description: 'Desc', price: 49.9, stock: 5, categoryId: 'cat-1' };
    await repo.update('prod-1', data);
    expect(prismaMock.product.update).toHaveBeenCalledWith({ where: { id: 'prod-1' }, data, include: { category: true } });
  });

  it('delete remove produto', async () => {
    (prismaMock.product.delete as jest.Mock).mockResolvedValue(mockProduct);
    await repo.delete('prod-1');
    expect(prismaMock.product.delete).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
  });

  it('findAll retorna resultado paginado com categoria', async () => {
    (prismaMock.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);
    (prismaMock.product.count as jest.Mock).mockResolvedValue(1);
    const result = await repo.findAll({ page: 2, limit: 5 });
    expect(result.meta).toEqual({ total: 1, page: 2, limit: 5, totalPages: 1 });
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 5, take: 5 }));
  });
});