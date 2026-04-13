import { UserRepository } from '../../../src/repositories/user.repository';
import prisma from '../../../src/lib/prisma';

jest.mock('../../../src/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

const prismaMock = prisma as jest.Mocked<typeof prisma>;

const mockUser = {
  id: 'uuid-1', name: 'Ana Silva', email: 'ana@email.com',
  cpf: '52998224725', phone: null, role: 'CLIENT' as const, createdAt: new Date(),
};

describe('UserRepository', () => {
  let repo: UserRepository;
  beforeEach(() => { repo = new UserRepository(); jest.clearAllMocks(); });

  it('findByEmail retorna usuário existente', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const result = await repo.findByEmail('ana@email.com');
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'ana@email.com' } });
    expect(result).toEqual(mockUser);
  });

  it('findById retorna usuário com select público', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    await repo.findById('uuid-1');
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'uuid-1' }, select: expect.objectContaining({ role: true }) }));
  });

  it('findByCpf retorna usuário por CPF', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    await repo.findByCpf('52998224725');
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { cpf: '52998224725' } });
  });

  it('create cria usuário sem password exposto', async () => {
    (prismaMock.user.create as jest.Mock).mockResolvedValue(mockUser);
    await repo.create({ name: 'Ana', email: 'ana@email.com', cpf: '52998224725', password: 'hash' });
    expect(prismaMock.user.create).toHaveBeenCalledWith(expect.objectContaining({ select: expect.objectContaining({ role: true }) }));
  });

  it('update atualiza campos e retorna select público', async () => {
    (prismaMock.user.update as jest.Mock).mockResolvedValue(mockUser);
    await repo.update('uuid-1', { name: 'Novo Nome' });
    expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'uuid-1' }, data: { name: 'Novo Nome' } }));
  });

  it('delete remove usuário', async () => {
    (prismaMock.user.delete as jest.Mock).mockResolvedValue(mockUser);
    await repo.delete('uuid-1');
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
  });

  it('findAll retorna resultado paginado', async () => {
    (prismaMock.user.findMany as jest.Mock).mockResolvedValue([mockUser]);
    (prismaMock.user.count as jest.Mock).mockResolvedValue(1);
    const result = await repo.findAll({ page: 1, limit: 10 });
    expect(result.meta).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
    expect(result.data).toHaveLength(1);
  });
});