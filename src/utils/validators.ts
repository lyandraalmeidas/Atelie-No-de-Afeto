import { cpf } from 'cpf-cnpj-validator';

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

export const isValidPassword = (password: string): boolean =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

// Valida CPF usando cpf-cnpj-validator (aceita com ou sem formatação)
export const isValidCpf = (value: string): boolean => cpf.isValid(value);

// Remove pontuação antes de salvar no banco (VarChar(11))
export const cleanCpf = (value: string): string => cpf.strip(value);

export const passwordStrengthMessage = (): string =>
  'A senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula e um número.';