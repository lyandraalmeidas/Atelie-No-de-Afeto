import request from "supertest";

interface MockOrderService {
  findAll: jest.Mock;
  findById: jest.Mock;
  findByUser: jest.Mock;
  create: jest.Mock;
  updateStatus: jest.Mock;
  delete: jest.Mock;
}

jest.mock("../../src/services/order.service", () => ({
  OrderService: jest.fn().mockImplementation(function (this: MockOrderService) {
    this.findAll = jest.fn();
    this.findById = jest.fn();
    this.findByUser = jest.fn();
    this.create = jest.fn();
    this.updateStatus = jest.fn();
    this.delete = jest.fn();
  }),
}));

import { OrderService } from "../../src/services/order.service";
import app from "../../src/app";
import { makeValidToken, makeMockOrder } from "./helpers";

const MockedOrderService = jest.mocked(OrderService);
const token = makeValidToken("user-uuid-1");
let mock: jest.Mocked<OrderService>;

beforeAll(() => {
  mock = MockedOrderService.mock.instances[0] as jest.Mocked<OrderService>;
});
beforeEach(() => jest.clearAllMocks());

describe("GET /api/orders", () => {
  it("deve retornar 200 com lista paginada", async () => {
    mock.findAll.mockResolvedValue({
      data: [makeMockOrder()],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/orders/my-orders", () => {
  it("deve retornar 200 com pedidos do usuário autenticado", async () => {
    mock.findByUser.mockResolvedValue({
      data: [makeMockOrder()],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    const res = await request(app)
      .get("/api/orders/my-orders")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(mock.findByUser).toHaveBeenCalledWith(
      "user-uuid-1",
      expect.any(Object),
    );
  });
});

describe("GET /api/orders/:id", () => {
  it("deve retornar 200 para pedido existente", async () => {
    mock.findById.mockResolvedValue(makeMockOrder());
    const res = await request(app)
      .get("/api/orders/order-uuid-1")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("PENDING");
  });

  it("deve retornar 404 para pedido inexistente", async () => {
    mock.findById.mockRejectedValue(
      Object.assign(new Error("Pedido não encontrado."), { statusCode: 404 }),
    );
    const res = await request(app)
      .get("/api/orders/nao-existe")
      .set("Authorization", token);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/orders", () => {
  const validBody = { items: [{ productId: "prod-1", quantity: 2 }] };

  it("deve retornar 201 ao criar pedido válido", async () => {
    mock.create.mockResolvedValue(makeMockOrder());
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", token)
      .send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.order).toBeDefined();
    expect(res.body.message).toBe("Pedido criado com sucesso.");
  });

  it("deve associar o pedido ao userId do token", async () => {
    mock.create.mockResolvedValue(makeMockOrder());
    await request(app)
      .post("/api/orders")
      .set("Authorization", token)
      .send(validBody);
    expect(mock.create).toHaveBeenCalledWith("user-uuid-1", validBody);
  });

  it("deve retornar 400 para lista de itens vazia", async () => {
    mock.create.mockRejectedValue(
      Object.assign(new Error("O pedido deve ter ao menos um item."), {
        statusCode: 400,
      }),
    );
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", token)
      .send({ items: [] });
    expect(res.status).toBe(400);
  });

  it("deve retornar 404 se produto não existe", async () => {
    mock.create.mockRejectedValue(
      Object.assign(new Error("Produto nao-existe não encontrado."), {
        statusCode: 404,
      }),
    );
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", token)
      .send({ items: [{ productId: "nao-existe", quantity: 1 }] });
    expect(res.status).toBe(404);
  });

  it("deve retornar 400 para quantidade zero", async () => {
    mock.create.mockRejectedValue(
      Object.assign(new Error("Quantidade deve ser maior que zero."), {
        statusCode: 400,
      }),
    );
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", token)
      .send({ items: [{ productId: "prod-1", quantity: 0 }] });
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/orders/:id/status", () => {
  it("deve retornar 200 ao atualizar status para CONFIRMED", async () => {
    mock.updateStatus.mockResolvedValue({
      ...makeMockOrder(),
      status: "CONFIRMED",
    });
    const res = await request(app)
      .patch("/api/orders/order-uuid-1/status")
      .set("Authorization", token)
      .send({ status: "CONFIRMED" });
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("CONFIRMED");
  });

  it("deve retornar 404 ao atualizar pedido inexistente", async () => {
    mock.updateStatus.mockRejectedValue(
      Object.assign(new Error("Pedido não encontrado."), { statusCode: 404 }),
    );
    const res = await request(app)
      .patch("/api/orders/nao-existe/status")
      .set("Authorization", token)
      .send({ status: "CONFIRMED" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/orders/:id", () => {
  it("deve retornar 204 ao deletar pedido existente", async () => {
    mock.delete.mockResolvedValue(undefined);
    const res = await request(app)
      .delete("/api/orders/order-uuid-1")
      .set("Authorization", token);
    expect(res.status).toBe(204);
  });

  it("deve retornar 404 ao deletar pedido inexistente", async () => {
    mock.delete.mockRejectedValue(
      Object.assign(new Error("Pedido não encontrado."), { statusCode: 404 }),
    );
    const res = await request(app)
      .delete("/api/orders/nao-existe")
      .set("Authorization", token);
    expect(res.status).toBe(404);
  });
});
