import { UserService } from "../../../src/services/user.service";
import { UserRepository } from "../../../src/repositories/user.repository";
import * as passwordUtils from "../../../src/utils/password";

jest.mock("../../../src/repositories/user.repository");
jest.mock("../../../src/utils/password");

const MockUserRepository = UserRepository as jest.MockedClass<
  typeof UserRepository
>;

const mockUser = {
  id: "uuid-1",
  name: "Ana Silva",
  email: "ana@email.com",
  cpf: "52998224725",
  phone: null,
  createdAt: new Date(),
};

let userService: UserService;
let userRepoMock: jest.Mocked<UserRepository>;

beforeEach(() => {
  MockUserRepository.mockClear();
  userService = new UserService();
  userRepoMock = MockUserRepository.mock
    .instances[0] as jest.Mocked<UserRepository>;
});

// --- findById ---
describe("UserService.findById", () => {
  it("deve retornar usuário existente", async () => {
    userRepoMock.findById = jest.fn().mockResolvedValue(mockUser);
    const result = await userService.findById("uuid-1");
    expect(result).toEqual(mockUser);
  });

  it("deve lançar erro 404 para usuário inexistente", async () => {
    userRepoMock.findById = jest.fn().mockResolvedValue(null);
    await expect(userService.findById("nao-existe")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// --- update ---
describe("UserService.update", () => {
  const validInput = {
    name: "Ana Santos",
    cpf: "52998224725",
    phone: "44999999999",
  };

  it("deve atualizar usuário com dados válidos", async () => {
    userRepoMock.findById = jest.fn().mockResolvedValue(mockUser);
    userRepoMock.findByCpf = jest.fn().mockResolvedValue(null);
    userRepoMock.update = jest
      .fn()
      .mockResolvedValue({ ...mockUser, name: "Ana Santos" });

    const result = await userService.update("uuid-1", "uuid-1", validInput);
    expect(result.name).toBe("Ana Santos");
  });

  it("deve lançar erro 403 ao tentar editar outro usuário", async () => {
    await expect(
      userService.update("uuid-1", "uuid-2", validInput),
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("deve lançar erro 400 para CPF inválido na atualização", async () => {
    userRepoMock.findById = jest.fn().mockResolvedValue(mockUser);
    await expect(
      userService.update("uuid-1", "uuid-1", {
        ...validInput,
        cpf: "00000000000",
      }),
    ).rejects.toMatchObject({ statusCode: 400, message: "CPF inválido." });
  });

  it("deve lançar erro 400 para senha fraca", async () => {
    userRepoMock.findById = jest.fn().mockResolvedValue(mockUser);
    await expect(
      userService.update("uuid-1", "uuid-1", {
        ...validInput,
        password: "fraca",
        confirmPassword: "fraca",
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("deve atualizar senha se for forte e confirmada", async () => {
    userRepoMock.findById = jest.fn().mockResolvedValue(mockUser);
    userRepoMock.findByCpf = jest.fn().mockResolvedValue(null);
    userRepoMock.update = jest.fn().mockResolvedValue(mockUser);
    (passwordUtils.hashPassword as jest.Mock).mockResolvedValue("nova_hash");

    // testa se o hash está agindo como deveria
    await userService.update("uuid-1", "uuid-1", {
      ...validInput,
      password: "NovaSenha1",
      confirmPassword: "NovaSenha1",
    });
    expect(passwordUtils.hashPassword).toHaveBeenCalledWith("NovaSenha1");
  });

  it("deve lançar 409 se CPF já pertence a outro usuário", async () => {
    userRepoMock.findById = jest.fn().mockResolvedValue(mockUser);
    userRepoMock.findByCpf = jest
      .fn()
      .mockResolvedValue({ ...mockUser, id: "outro-uuid" });

    await expect(
      userService.update("uuid-1", "uuid-1", validInput),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});

// --- delete ---
describe("UserService.delete", () => {
  it("deve deletar o próprio usuário", async () => {
    userRepoMock.findById = jest.fn().mockResolvedValue(mockUser);
    userRepoMock.delete = jest.fn().mockResolvedValue(undefined);

    await expect(
      userService.delete("uuid-1", "uuid-1"),
    ).resolves.toBeUndefined();
  });

  it("deve lançar 403 ao tentar deletar outro usuário", async () => {
    await expect(userService.delete("uuid-1", "uuid-2")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("deve lançar 404 ao deletar usuário inexistente", async () => {
    userRepoMock.findById = jest.fn().mockResolvedValue(null);
    await expect(userService.delete("uuid-1", "uuid-1")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
