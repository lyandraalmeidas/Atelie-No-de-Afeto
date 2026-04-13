import { AuthService } from "../../../src/services/auth.service";
import { UserRepository } from "../../../src/repositories/user.repository";
import * as passwordUtils from "../../../src/utils/password";
import * as jwtUtils from "../../../src/utils/jwt";

jest.mock("../../../src/repositories/user.repository");
jest.mock("../../../src/utils/password");
jest.mock("../../../src/utils/jwt");

const MockUserRepository = UserRepository as jest.MockedClass<
  typeof UserRepository
>;

const mockUser = {
  id: "uuid-1",
  name: "Ana Silva",
  email: "ana@email.com",
  cpf: "52998224725",
  phone: null,
  password: "hashed_Senha123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

let authService: AuthService;
let userRepoMock: jest.Mocked<UserRepository>;

beforeEach(() => {
  MockUserRepository.mockClear();
  authService = new AuthService();
  userRepoMock = MockUserRepository.mock
    .instances[0] as jest.Mocked<UserRepository>;
});

// --- Register ---
describe("AuthService.register", () => {
  const validInput = {
    name: "Ana Silva",
    email: "ana@email.com",
    cpf: "52998224725",
    password: "Senha123",
    confirmPassword: "Senha123",
  };

  it("deve cadastrar usuário com dados válidos", async () => {
    userRepoMock.findByEmail = jest.fn().mockResolvedValue(null);
    userRepoMock.findByCpf = jest.fn().mockResolvedValue(null);
    userRepoMock.create = jest.fn().mockResolvedValue(mockUser);
    (passwordUtils.hashPassword as jest.Mock).mockResolvedValue(
      "hashed_Senha123",
    );

    const result = await authService.register(validInput);
    expect(result).toMatchObject({ name: "Ana Silva", email: "ana@email.com" });
  });

  it("deve lançar erro 409 se e-mail já cadastrado", async () => {
    userRepoMock.findByEmail = jest.fn().mockResolvedValue(mockUser);

    await expect(authService.register(validInput)).rejects.toMatchObject({
      statusCode: 409,
      message: "E-mail já cadastrado.",
    });
  });

  it("deve lançar erro 409 se CPF já cadastrado", async () => {
    userRepoMock.findByEmail = jest.fn().mockResolvedValue(null);
    userRepoMock.findByCpf = jest.fn().mockResolvedValue(mockUser);

    await expect(authService.register(validInput)).rejects.toMatchObject({
      statusCode: 409,
      message: "CPF já cadastrado.",
    });
  });

  it("deve lançar erro 400 para e-mail inválido", async () => {
    await expect(
      authService.register({ ...validInput, email: "invalido" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("deve lançar erro 400 para CPF inválido", async () => {
    userRepoMock.findByEmail = jest.fn().mockResolvedValue(null);

    await expect(
      authService.register({ ...validInput, cpf: "11111111111" }),
    ).rejects.toMatchObject({ statusCode: 400, message: "CPF inválido." });
  });

  it("deve lançar erro 400 para senha fraca", async () => {
    userRepoMock.findByEmail = jest.fn().mockResolvedValue(null);

    await expect(
      authService.register({
        ...validInput,
        password: "fraca",
        confirmPassword: "fraca",
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("deve lançar erro 400 quando senhas não conferem", async () => {
    userRepoMock.findByEmail = jest.fn().mockResolvedValue(null);

    await expect(
      authService.register({ ...validInput, confirmPassword: "Outra123" }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "As senhas não conferem.",
    });
  });

  it("deve lançar erro 400 quando nome está vazio", async () => {
    await expect(
      authService.register({ ...validInput, name: "" }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Nome é obrigatório.",
    });
  });
});

// --- Login ---
describe("AuthService.login", () => {
  it("deve retornar token e usuário com credenciais válidas", async () => {
    userRepoMock.findByEmail = jest.fn().mockResolvedValue(mockUser);
    (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(true);
    (jwtUtils.signToken as jest.Mock).mockReturnValue("jwt-token");

    const result = await authService.login({
      email: "ana@email.com",
      password: "Senha123",
    });

    expect(result.token).toBe("jwt-token");
    expect(result.user.email).toBe("ana@email.com");
    expect(result.user).not.toHaveProperty("password");
  });

  it("deve lançar erro 401 se usuário não existe", async () => {
    userRepoMock.findByEmail = jest.fn().mockResolvedValue(null);

    await expect(
      authService.login({ email: "naoexiste@email.com", password: "Senha123" }),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Credenciais inválidas.",
    });
  });

  it("deve lançar erro 401 se senha incorreta", async () => {
    userRepoMock.findByEmail = jest.fn().mockResolvedValue(mockUser);
    (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.login({ email: "ana@email.com", password: "ErradA1" }),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Credenciais inválidas.",
    });
  });

  it("deve lançar erro 400 para e-mail com formato inválido", async () => {
    await expect(
      authService.login({ email: "invalido", password: "Senha123" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
