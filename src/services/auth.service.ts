import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { isValidEmail, isValidPassword, isValidCpf, cleanCpf, passwordStrengthMessage } from '../utils/validators';
import { AppError } from '../utils/AppError';
import { CreateUserInput, LoginInput, AuthResponse, UserPublic } from '../types';

export class AuthService {
  private userRepository = new UserRepository();

  async register(input: CreateUserInput): Promise<UserPublic> {
    this.validateRegistrationInput(input);
    const normalizedCpf = cleanCpf(input.cpf);
    await this.ensureEmailNotTaken(input.email);
    await this.ensureCpfNotTaken(normalizedCpf);
    const hashedPassword = await hashPassword(input.password);
    return this.userRepository.create({ ...input, cpf: normalizedCpf, password: hashedPassword });
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    if (!isValidEmail(input.email)) throw new AppError('E-mail inválido.', 400);
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) throw new AppError('Credenciais inválidas.', 401);
    const isMatch = await comparePassword(input.password, user.password);
    if (!isMatch) throw new AppError('Credenciais inválidas.', 401);
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const { password: _, ...userPublic } = user;
    return { token, user: userPublic as UserPublic };
  }

  private validateRegistrationInput(input: CreateUserInput): void {
    if (!input.name?.trim()) throw new AppError('Nome é obrigatório.', 400);
    if (!isValidEmail(input.email)) throw new AppError('E-mail inválido.', 400);
    if (!isValidCpf(input.cpf)) throw new AppError('CPF inválido.', 400);
    if (!isValidPassword(input.password)) throw new AppError(passwordStrengthMessage(), 400);
    if (input.password !== input.confirmPassword) throw new AppError('As senhas não conferem.', 400);
  }

  private async ensureEmailNotTaken(email: string): Promise<void> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new AppError('E-mail já cadastrado.', 409);
  }

  private async ensureCpfNotTaken(cpf: string): Promise<void> {
    const existing = await this.userRepository.findByCpf(cpf);
    if (existing) throw new AppError('CPF já cadastrado.', 409);
  }
}