import request from "supertest";

interface MockCategoryService {
  findAll: jest.Mock;
  findById: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
}

jest.mock("../../src/services/category.service", () => ({
  CategoryService: jest.fn().mockImplementation(function (
    this: MockCategoryService,
  ) {
    this.findAll = jest.fn();
    this.findById = jest.fn();
    this.create = jest.fn();
    this.update = jest.fn();
    this.delete = jest.fn();
  }),
}));

import { CategoryService } from "../../src/services/category.service";
import app from "../../src/app";
import { makeValidToken, makeMockCategory } from "./helpers";

const MockedCategoryService = jest.mocked(CategoryService);
const token = makeValidToken();
let mock: jest.Mocked<CategoryService>;

beforeAll(() => {
  mock = MockedCategoryService.mock
    .instances[0] as jest.Mocked<CategoryService>;
});
beforeEach(() => jest.clearAllMocks());

describe("GET /api/categories", () => {
  it("deve retornar 200 com lista paginada", async () => {
    mock.findAll.mockResolvedValue({
      data: [makeMockCategory()],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    const res = await request(app)
      .get("/api/categories")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/categories/:id", () => {
  it("deve retornar 200 para categoria existente", async () => {
    mock.findById.mockResolvedValue(makeMockCategory());
    const res = await request(app)
      .get("/api/categories/cat-uuid-1")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Laços");
  });

  it("deve retornar 404 para categoria inexistente", async () => {
    mock.findById.mockRejectedValue(
      Object.assign(new Error("Categoria não encontrada."), {
        statusCode: 404,
      }),
    );
    const res = await request(app)
      .get("/api/categories/nao-existe")
      .set("Authorization", token);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/categories", () => {
  it("deve retornar 201 ao criar categoria válida", async () => {
    mock.create.mockResolvedValue(makeMockCategory());
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", token)
      .send({ name: "Laços" });
    expect(res.status).toBe(201);
    expect(res.body.category.name).toBe("Laços");
  });

  it("deve retornar 409 para nome duplicado", async () => {
    mock.create.mockRejectedValue(
      Object.assign(new Error("Já existe uma categoria com esse nome."), {
        statusCode: 409,
      }),
    );
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", token)
      .send({ name: "Laços" });
    expect(res.status).toBe(409);
  });

  it("deve retornar 400 para nome vazio", async () => {
    mock.create.mockRejectedValue(
      Object.assign(new Error("Nome da categoria é obrigatório."), {
        statusCode: 400,
      }),
    );
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", token)
      .send({ name: "" });
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/categories/:id", () => {
  it("deve retornar 200 ao atualizar categoria existente", async () => {
    mock.update.mockResolvedValue({
      ...makeMockCategory(),
      name: "Acessórios",
    });
    const res = await request(app)
      .put("/api/categories/cat-uuid-1")
      .set("Authorization", token)
      .send({ name: "Acessórios" });
    expect(res.status).toBe(200);
    expect(res.body.category.name).toBe("Acessórios");
  });

  it("deve retornar 404 ao atualizar categoria inexistente", async () => {
    mock.update.mockRejectedValue(
      Object.assign(new Error("Categoria não encontrada."), {
        statusCode: 404,
      }),
    );
    const res = await request(app)
      .put("/api/categories/nao-existe")
      .set("Authorization", token)
      .send({ name: "Qualquer" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/categories/:id", () => {
  it("deve retornar 204 ao deletar categoria existente", async () => {
    mock.delete.mockResolvedValue(undefined);
    const res = await request(app)
      .delete("/api/categories/cat-uuid-1")
      .set("Authorization", token);
    expect(res.status).toBe(204);
  });

  it("deve retornar 404 ao deletar categoria inexistente", async () => {
    mock.delete.mockRejectedValue(
      Object.assign(new Error("Categoria não encontrada."), {
        statusCode: 404,
      }),
    );
    const res = await request(app)
      .delete("/api/categories/nao-existe")
      .set("Authorization", token);
    expect(res.status).toBe(404);
  });
});
