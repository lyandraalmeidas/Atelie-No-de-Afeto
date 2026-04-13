import { cpf } from 'cpf-cnpj-validator';

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

// aqui ele tá testando se a senha tem todos os requisitos
export const isValidPassword = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

export const passwordStrengthMessage =
  'Mínimo 8 caracteres, uma maiúscula, uma minúscula e um número.';

// aqui ele valida o cpf usando a biblioteca cpf-cnpj-validator
export const isValidCpf = (value) => cpf.isValid(value);

// aqui ele tira as pontuações do cpf pra mandar pro banco
export const cleanCpf = (value) => cpf.strip(value);