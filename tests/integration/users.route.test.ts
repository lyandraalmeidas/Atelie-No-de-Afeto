import request from "supertest";

interface MockUserService {
  findAll: jest.Mock;
  findById: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
}

jest.mock("../../src/services/user.service", () => ({
  UserService: jest.fn().mockImplementation(function (this: MockUserService) {
    this.findAll = jest.fn();
    this.findById = jest.fn();
    this.update = jest.fn();
    this.delete = jest.fn();
  }),
}));

import { UserService } from "../../src/services/user.service";
import app from "../../src/app";
import { makeValidToken, makeMockUser } from "./helpers";

const MockedUserService = jest.mocked(UserService);
const token = makeValidToken("user-uuid-1");
let mock: jest.Mocked<UserService>;

beforeAll(() => {
  mock = MockedUserService.mock.instances[0] as jest.Mocked<UserService>;
});
beforeEach(() => jest.clearAllMocks());

describe("GET /api/users", () => {
  it("deve retornar 200 com lista paginada", async () => {
    mock.findAll.mockResolvedValue({
      data: [makeMockUser()],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(401);
  });

  it("deve aceitar parâmetros de paginação", async () => {
    mock.findAll.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 2, limit: 5, totalPages: 0 },
    });
    const res = await request(app)
      .get("/api/users?page=2&limit=5")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(mock.findAll).toHaveBeenCalledWith({ page: 2, limit: 5 });
  });
});

describe("GET /api/users/:id", () => {
  it("deve retornar 200 para usuário existente", async () => {
    mock.findById.mockResolvedValue(makeMockUser());
    const res = await request(app)
      .get("/api/users/user-uuid-1")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("ana@email.com");
  });

  it("deve retornar 404 para usuário inexistente", async () => {
    mock.findById.mockRejectedValue(
      Object.assign(new Error("Usuário não encontrado."), { statusCode: 404 }),
    );
    const res = await request(app)
      .get("/api/users/nao-existe")
      .set("Authorization", token);
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/users/:id", () => {
  const updateBody = {
    name: "Ana Santos",
    cpf: "52998224725",
    phone: "44999999999",
  };

  it("deve retornar 200 ao atualizar próprio usuário", async () => {
    mock.update.mockResolvedValue({ ...makeMockUser(), name: "Ana Santos" });
    const res = await request(app)
      .put("/api/users/user-uuid-1")
      .set("Authorization", token)
      .send(updateBody);
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Ana Santos");
  });

  it("deve retornar 403 ao tentar editar outro usuário", async () => {
    mock.update.mockRejectedValue(
      Object.assign(new Error("Você só pode editar sua própria conta."), {
        statusCode: 403,
      }),
    );
    const res = await request(app)
      .put("/api/users/outro-uuid")
      .set("Authorization", token)
      .send(updateBody);
    expect(res.status).toBe(403);
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app)
      .put("/api/users/user-uuid-1")
      .send(updateBody);
    expect(res.status).toBe(401);
  });

  it("não deve permitir alteração de e-mail", async () => {
    mock.update.mockResolvedValue(makeMockUser());
    await request(app)
      .put("/api/users/user-uuid-1")
      .set("Authorization", token)
      .send({ ...updateBody, email: "novo@email.com" });
    const callArg = mock.update.mock.calls[0][2];
    expect(callArg).not.toHaveProperty("email");
  });

  it("deve retornar 409 para CPF já cadastrado por outro usuário", async () => {
    mock.update.mockRejectedValue(
      Object.assign(new Error("CPF já cadastrado por outro usuário."), {
        statusCode: 409,
      }),
    );
    const res = await request(app)
      .put("/api/users/user-uuid-1")
      .set("Authorization", token)
      .send(updateBody);
    expect(res.status).toBe(409);
  });
});

describe("DELETE /api/users/:id", () => {
  it("deve retornar 204 ao deletar próprio usuário", async () => {
    mock.delete.mockResolvedValue(undefined);
    const res = await request(app)
      .delete("/api/users/user-uuid-1")
      .set("Authorization", token);
    expect(res.status).toBe(204);
  });

  it("deve retornar 403 ao tentar deletar outro usuário", async () => {
    mock.delete.mockRejectedValue(
      Object.assign(new Error("Você só pode excluir sua própria conta."), {
        statusCode: 403,
      }),
    );
    const res = await request(app)
      .delete("/api/users/outro-uuid")
      .set("Authorization", token);
    expect(res.status).toBe(403);
  });

  it("deve retornar 404 ao deletar usuário inexistente", async () => {
    mock.delete.mockRejectedValue(
      Object.assign(new Error("Usuário não encontrado."), { statusCode: 404 }),
    );
    const res = await request(app)
      .delete("/api/users/user-uuid-1")
      .set("Authorization", token);
    expect(res.status).toBe(404);
  });
});
