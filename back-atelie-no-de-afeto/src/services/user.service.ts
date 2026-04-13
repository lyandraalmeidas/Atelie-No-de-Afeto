import { UserRepository } from '../repositories/user.repository';
import { hashPassword } from '../utils/password';
import { isValidCpf, isValidPassword, passwordStrengthMessage } from '../utils/validators';
import { AppError } from '../utils/AppError';
import { UpdateUserInput, PaginationQuery, UserPublic, PaginatedResult } from '../types';

export class UserService {
  private userRepository = new UserRepository();

  async findById(id: string): Promise<UserPublic> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    return user;
  }

  async findAll(pagination: PaginationQuery): Promise<PaginatedResult<UserPublic>> {
    return this.userRepository.findAll(pagination);
  }

  async update(requesterId: string, targetId: string, input: UpdateUserInput): Promise<UserPublic> {
    if (requesterId !== targetId) throw new AppError('Você só pode editar sua própria conta.', 403);
    await this.ensureUserExists(targetId);
    this.validateUpdateInput(input);
    await this.ensureCpfNotTakenByOther(input.cpf, targetId);
    const updateData = await this.buildUpdateData(input);
    return this.userRepository.update(targetId, updateData);
  }

  async delete(requesterId: string, targetId: string): Promise<void> {
    if (requesterId !== targetId) throw new AppError('Você só pode excluir sua própria conta.', 403);
    await this.ensureUserExists(targetId);
    await this.userRepository.delete(targetId);
  }

  private async ensureUserExists(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('Usuário não encontrado.', 404);
  }

  private validateUpdateInput(input: UpdateUserInput): void {
    if (!input.name?.trim()) throw new AppError('Nome é obrigatório.', 400);
    if (!isValidCpf(input.cpf)) throw new AppError('CPF inválido.', 400);
    if (input.password && !isValidPassword(input.password)) throw new AppError(passwordStrengthMessage(), 400);
    if (input.password && input.password !== input.confirmPassword) throw new AppError('As senhas não conferem.', 400);
  }

  private async ensureCpfNotTakenByOther(cpf: string, userId: string): Promise<void> {
    const existing = await this.userRepository.findByCpf(cpf);
    if (existing && existing.id !== userId) throw new AppError('CPF já cadastrado por outro usuário.', 409);
  }

  private async buildUpdateData(input: UpdateUserInput): Promise<Partial<{ name: string; cpf: string; phone: string; password: string }>> {
    const data: Partial<{ name: string; cpf: string; phone: string; password: string }> = {
      name: input.name,
      cpf: input.cpf,
      ...(input.phone && { phone: input.phone }),
    };
    if (input.password) data.password = await hashPassword(input.password);
    return data;
  }
}