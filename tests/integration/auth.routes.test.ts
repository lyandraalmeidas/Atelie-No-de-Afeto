import request from "supertest";

interface MockAuthService {
  register: jest.Mock;
  login: jest.Mock;
}

jest.mock("../../src/services/auth.service", () => ({
  AuthService: jest.fn().mockImplementation(function (this: MockAuthService) {
    this.register = jest.fn();
    this.login = jest.fn();
  }),
}));

import { AuthService } from "../../src/services/auth.service";
import app from "../../src/app";
import { makeMockUser } from "./helpers";

const MockedAuthService = jest.mocked(AuthService);
let mock: jest.Mocked<AuthService>;

beforeAll(() => {
  mock = MockedAuthService.mock.instances[0] as jest.Mocked<AuthService>;
});

beforeEach(() => jest.clearAllMocks());

describe("POST /api/auth/register", () => {
  const validBody = {
    name: "Ana Silva",
    email: "ana@email.com",
    cpf: "52998224725",
    password: "Senha123",
    confirmPassword: "Senha123",
  };

  it("deve retornar 201 ao cadastrar usuário válido", async () => {
    mock.register.mockResolvedValue(makeMockUser());
    const res = await request(app).post("/api/auth/register").send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Usuário cadastrado com sucesso.");
    expect(res.body.user.email).toBe("ana@email.com");
  });

  it("deve retornar 409 para e-mail duplicado", async () => {
    mock.register.mockRejectedValue(
      Object.assign(new Error("E-mail já cadastrado."), { statusCode: 409 }),
    );
    const res = await request(app).post("/api/auth/register").send(validBody);
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("E-mail já cadastrado.");
  });

  it("deve retornar 409 para CPF duplicado", async () => {
    mock.register.mockRejectedValue(
      Object.assign(new Error("CPF já cadastrado."), { statusCode: 409 }),
    );
    const res = await request(app).post("/api/auth/register").send(validBody);
    expect(res.status).toBe(409);
  });

  it("deve retornar 400 para e-mail inválido", async () => {
    mock.register.mockRejectedValue(
      Object.assign(new Error("E-mail inválido."), { statusCode: 400 }),
    );
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validBody, email: "invalido" });
    expect(res.status).toBe(400);
  });

  it("deve retornar 400 para senha fraca", async () => {
    mock.register.mockRejectedValue(
      Object.assign(new Error("A senha deve ter no mínimo 8 caracteres"), {
        statusCode: 400,
      }),
    );
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validBody, password: "fraca", confirmPassword: "fraca" });
    expect(res.status).toBe(400);
  });

  it("deve retornar 400 quando senhas não conferem", async () => {
    mock.register.mockRejectedValue(
      Object.assign(new Error("As senhas não conferem."), { statusCode: 400 }),
    );
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validBody, confirmPassword: "Outra123" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("deve retornar 200 e token com credenciais válidas", async () => {
    mock.login.mockResolvedValue({
      token: "jwt-token-mock",
      user: makeMockUser(),
    });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ana@email.com", password: "Senha123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBe("jwt-token-mock");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("deve retornar 401 para credenciais inválidas", async () => {
    mock.login.mockRejectedValue(
      Object.assign(new Error("Credenciais inválidas."), { statusCode: 401 }),
    );
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ana@email.com", password: "errada" });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Credenciais inválidas.");
  });

  it("deve retornar 401 para usuário inexistente", async () => {
    mock.login.mockRejectedValue(
      Object.assign(new Error("Credenciais inválidas."), { statusCode: 401 }),
    );
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "naoexiste@email.com", password: "Senha123" });
    expect(res.status).toBe(401);
  });

  it("deve retornar 400 para e-mail inválido no login", async () => {
    mock.login.mockRejectedValue(
      Object.assign(new Error("E-mail inválido."), { statusCode: 400 }),
    );
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "invalido", password: "Senha123" });
    expect(res.status).toBe(400);
  });
});
