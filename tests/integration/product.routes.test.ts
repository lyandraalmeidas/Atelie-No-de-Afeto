import request from "supertest";

interface MockProductService {
  findAll: jest.Mock;
  findById: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
}

jest.mock("../../src/services/product.service", () => ({
  ProductService: jest.fn().mockImplementation(function (
    this: MockProductService,
  ) {
    this.findAll = jest.fn();
    this.findById = jest.fn();
    this.create = jest.fn();
    this.update = jest.fn();
    this.delete = jest.fn();
  }),
}));

import { ProductService } from "../../src/services/product.service";
import app from "../../src/app";
import { makeValidToken, makeMockProduct } from "./helpers";

const MockedProductService = jest.mocked(ProductService);
const token = makeValidToken();
const validBody = {
  name: "Laço de Seda",
  description: "Laço artesanal macio",
  price: 39.9,
  stock: 20,
  categoryId: "cat-uuid-1",
};
let mock: jest.Mocked<ProductService>;

beforeAll(() => {
  mock = MockedProductService.mock.instances[0] as jest.Mocked<ProductService>;
});
beforeEach(() => jest.clearAllMocks());

describe("GET /api/products", () => {
  it("deve retornar 200 com lista paginada", async () => {
    mock.findAll.mockResolvedValue({
      data: [makeMockProduct()],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    const res = await request(app)
      .get("/api/products")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("deve retornar 200 sem token (rota pública)", async () => {
    mock.findAll.mockResolvedValue({
      data: [makeMockProduct()],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
  });

  it("deve aceitar parâmetros de paginação", async () => {
    mock.findAll.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 2, limit: 5, totalPages: 0 },
    });
    const res = await request(app)
      .get("/api/products?page=2&limit=5")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(mock.findAll).toHaveBeenCalledWith({ page: 2, limit: 5 });
  });
});

describe("GET /api/products/:id", () => {
  it("deve retornar 200 para produto existente", async () => {
    mock.findById.mockResolvedValue(makeMockProduct());
    const res = await request(app)
      .get("/api/products/prod-uuid-1")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Laço de Seda");
  });

  it("deve retornar 404 para produto inexistente", async () => {
    mock.findById.mockRejectedValue(
      Object.assign(new Error("Produto não encontrado."), { statusCode: 404 }),
    );
    const res = await request(app)
      .get("/api/products/nao-existe")
      .set("Authorization", token);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/products", () => {
  it("deve retornar 201 ao criar produto válido", async () => {
    mock.create.mockResolvedValue(makeMockProduct());
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", token)
      .send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.product.name).toBe("Laço de Seda");
  });

  it("deve retornar 400 para preço zero", async () => {
    mock.create.mockRejectedValue(
      Object.assign(new Error("Preço deve ser maior que zero."), {
        statusCode: 400,
      }),
    );
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", token)
      .send({ ...validBody, price: 0 });
    expect(res.status).toBe(400);
  });

  it("deve retornar 400 para estoque negativo", async () => {
    mock.create.mockRejectedValue(
      Object.assign(new Error("Estoque não pode ser negativo."), {
        statusCode: 400,
      }),
    );
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", token)
      .send({ ...validBody, stock: -1 });
    expect(res.status).toBe(400);
  });

  it("deve retornar 404 se categoria não existe", async () => {
    mock.create.mockRejectedValue(
      Object.assign(new Error("Categoria não encontrada."), {
        statusCode: 404,
      }),
    );
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", token)
      .send({ ...validBody, categoryId: "nao-existe" });
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/products/:id", () => {
  it("deve retornar 200 ao atualizar produto existente", async () => {
    mock.update.mockResolvedValue({
      ...makeMockProduct(),
      name: "Laço Premium",
    });
    const res = await request(app)
      .put("/api/products/prod-uuid-1")
      .set("Authorization", token)
      .send({ ...validBody, name: "Laço Premium" });
    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe("Laço Premium");
  });

  it("deve retornar 404 ao atualizar produto inexistente", async () => {
    mock.update.mockRejectedValue(
      Object.assign(new Error("Produto não encontrado."), { statusCode: 404 }),
    );
    const res = await request(app)
      .put("/api/products/nao-existe")
      .set("Authorization", token)
      .send(validBody);
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/products/:id", () => {
  it("deve retornar 204 ao deletar produto existente", async () => {
    mock.delete.mockResolvedValue(undefined);
    const res = await request(app)
      .delete("/api/products/prod-uuid-1")
      .set("Authorization", token);
    expect(res.status).toBe(204);
  });

  it("deve retornar 404 ao deletar produto inexistente", async () => {
    mock.delete.mockRejectedValue(
      Object.assign(new Error("Produto não encontrado."), { statusCode: 404 }),
    );
    const res = await request(app)
      .delete("/api/products/nao-existe")
      .set("Authorization", token);
    expect(res.status).toBe(404);
  });
});
