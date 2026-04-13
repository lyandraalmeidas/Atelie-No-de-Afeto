import { CategoryRepository } from '../../../src/repositories/category.repository';
import prisma from '../../../src/lib/prisma';

jest.mock('../../../src/lib/prisma', () => ({
  category: {
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

describe('CategoryRepository', () => {
  let repo: CategoryRepository;
  beforeEach(() => { repo = new CategoryRepository(); jest.clearAllMocks(); });

  it('findById retorna categoria com produtos', async () => {
    (prismaMock.category.findUnique as jest.Mock).mockResolvedValue({ ...mockCategory, products: [] });
    await repo.findById('cat-1');
    expect(prismaMock.category.findUnique).toHaveBeenCalledWith({ where: { id: 'cat-1' }, include: { products: true } });
  });

  it('findByName retorna categoria pelo nome', async () => {
    (prismaMock.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
    await repo.findByName('Laços');
    expect(prismaMock.category.findUnique).toHaveBeenCalledWith({ where: { name: 'Laços' } });
  });

  it('create cria nova categoria', async () => {
    (prismaMock.category.create as jest.Mock).mockResolvedValue(mockCategory);
    const result = await repo.create({ name: 'Laços' });
    expect(prismaMock.category.create).toHaveBeenCalledWith({ data: { name: 'Laços' } });
    expect(result).toEqual(mockCategory);
  });

  it('update atualiza categoria', async () => {
    (prismaMock.category.update as jest.Mock).mockResolvedValue(mockCategory);
    await repo.update('cat-1', { name: 'Acessórios' });
    expect(prismaMock.category.update).toHaveBeenCalledWith({ where: { id: 'cat-1' }, data: { name: 'Acessórios' } });
  });

  it('delete remove categoria', async () => {
    (prismaMock.category.delete as jest.Mock).mockResolvedValue(mockCategory);
    await repo.delete('cat-1');
    expect(prismaMock.category.delete).toHaveBeenCalledWith({ where: { id: 'cat-1' } });
  });

  it('findAll retorna resultado paginado', async () => {
    (prismaMock.category.findMany as jest.Mock).mockResolvedValue([mockCategory]);
    (prismaMock.category.count as jest.Mock).mockResolvedValue(3);
    const result = await repo.findAll({ page: 1, limit: 10 });
    expect(result.meta).toEqual({ total: 3, page: 1, limit: 10, totalPages: 1 });
  });
});