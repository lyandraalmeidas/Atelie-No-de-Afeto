import {
  isValidEmail,
  isValidPassword,
  isValidCpf,
} from "../../src/utils/validators";

describe("Validators", () => {
  // --- Email ---
  describe("isValidEmail", () => {
    it("deve aceitar e-mail válido", () => {
      expect(isValidEmail("usuario@email.com")).toBe(true);
    });

    it("deve aceitar e-mail com subdomínio", () => {
      expect(isValidEmail("user@mail.co.uk")).toBe(true);
    });

    it("deve rejeitar e-mail sem @", () => {
      expect(isValidEmail("usuarioemail.com")).toBe(false);
    });

    it("deve rejeitar e-mail sem domínio", () => {
      expect(isValidEmail("usuario@")).toBe(false);
    });

    it("deve rejeitar string vazia", () => {
      expect(isValidEmail("")).toBe(false);
    });
  });

  // --- Password ---
  describe("isValidPassword", () => {
    it("deve aceitar senha forte válida", () => {
      expect(isValidPassword("Senha123")).toBe(true);
    });

    it("deve rejeitar senha sem letra maiúscula", () => {
      expect(isValidPassword("senha123")).toBe(false);
    });

    it("deve rejeitar senha sem letra minúscula", () => {
      expect(isValidPassword("SENHA123")).toBe(false);
    });

    it("deve rejeitar senha sem número", () => {
      expect(isValidPassword("SenhaForte")).toBe(false);
    });

    it("deve rejeitar senha com menos de 8 caracteres", () => {
      expect(isValidPassword("Ab1")).toBe(false);
    });
  });

  // --- CPF ---
  describe("isValidCpf", () => {
    it("deve aceitar CPF válido", () => {
      expect(isValidCpf("52998224725")).toBe(true);
    });

    it("deve aceitar CPF com pontuação", () => {
      expect(isValidCpf("529.982.247-25")).toBe(true);
    });

    it("deve rejeitar CPF com todos os dígitos iguais", () => {
      expect(isValidCpf("11111111111")).toBe(false);
    });

    it("deve rejeitar CPF com tamanho incorreto", () => {
      expect(isValidCpf("1234567890")).toBe(false);
    });

    it("deve rejeitar CPF com dígito verificador errado", () => {
      expect(isValidCpf("52998224726")).toBe(false);
    });

    it("deve rejeitar string vazia", () => {
      expect(isValidCpf("")).toBe(false);
    });
  });
});
