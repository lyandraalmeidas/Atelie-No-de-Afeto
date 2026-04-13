import prisma from '../lib/prisma';
import { CreateUserInput, PaginationQuery, PaginatedResult, UserPublic } from '../types';

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  cpf: true,
  phone: true,
  role: true,
  createdAt: true,
};

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: userPublicSelect });
  }

  async findByCpf(cpf: string) {
    return prisma.user.findUnique({ where: { cpf } });
  }

  async create(data: Omit<CreateUserInput, 'confirmPassword'> & { password: string }) {
    return prisma.user.create({
      data: { name: data.name, email: data.email, cpf: data.cpf, phone: data.phone, password: data.password },
      select: userPublicSelect,
    });
  }

  async update(id: string, data: Partial<{ name: string; cpf: string; phone: string; password: string }>) {
    return prisma.user.update({ where: { id }, data, select: userPublicSelect });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async findAll(pagination: PaginationQuery): Promise<PaginatedResult<UserPublic>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.user.findMany({ skip, take: limit, select: userPublicSelect, orderBy: { createdAt: 'desc' } }),
      prisma.user.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}