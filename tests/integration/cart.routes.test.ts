import request from "supertest";
import { CartService } from "../../src/services/cart.service";
import app from "../../src/app";
import { makeValidToken } from "./helpers";

// Usa spyOn no protótipo — funciona independentemente de quando o controlador instancia o serviço
const mockGetCart = jest.spyOn(CartService.prototype, "getCart");
const mockAddItem = jest.spyOn(CartService.prototype, "addItem");
const mockUpdateItem = jest.spyOn(CartService.prototype, "updateItem");
const mockRemoveItem = jest.spyOn(CartService.prototype, "removeItem");
const mockClear = jest.spyOn(CartService.prototype, "clear");

const token = makeValidToken("user-1");

const makeCarrinho = (itens: object[] = []) => ({
  id: "cart-1",
  userId: "user-1",
  updatedAt: new Date().toISOString(),
  items: itens,
});

beforeEach(() => jest.clearAllMocks());

// ─── GET /api/carrinho ────────────────────────────────────────
describe("GET /api/carrinho", () => {
  it("retorna 200 com o carrinho do usuário autenticado", async () => {
    mockGetCart.mockResolvedValue(makeCarrinho() as never);
    const res = await request(app)
      .get("/api/carrinho")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("cart-1");
    expect(res.body.items).toHaveLength(0);
  });

  it("retorna 200 com itens quando o carrinho tem produtos", async () => {
    mockGetCart.mockResolvedValue(
      makeCarrinho([{ productId: "prod-1", quantity: 3 }]) as never,
    );
    const res = await request(app)
      .get("/api/carrinho")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  it("retorna 401 sem token de autenticação", async () => {
    const res = await request(app).get("/api/carrinho");
    expect(res.status).toBe(401);
  });

  it("passa o userId correto do token para o service", async () => {
    mockGetCart.mockResolvedValue(makeCarrinho() as never);
    await request(app).get("/api/carrinho").set("Authorization", token);
    expect(mockGetCart).toHaveBeenCalledWith("user-1");
  });
});

// ─── POST /api/carrinho/itens ─────────────────────────────────
describe("POST /api/carrinho/itens", () => {
  it("retorna 200 ao adicionar item com estoque disponível", async () => {
    mockAddItem.mockResolvedValue(
      makeCarrinho([{ productId: "prod-1", quantity: 2 }]) as never,
    );
    const res = await request(app)
      .post("/api/carrinho/itens")
      .set("Authorization", token)
      .send({ productId: "prod-1", quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  it("chama addItem com os parâmetros corretos", async () => {
    mockAddItem.mockResolvedValue(makeCarrinho() as never);
    await request(app)
      .post("/api/carrinho/itens")
      .set("Authorization", token)
      .send({ productId: "prod-1", quantity: 3 });
    expect(mockAddItem).toHaveBeenCalledWith("user-1", "prod-1", 3);
  });

  it("usa quantity 1 como padrão quando não informada", async () => {
    mockAddItem.mockResolvedValue(makeCarrinho() as never);
    await request(app)
      .post("/api/carrinho/itens")
      .set("Authorization", token)
      .send({ productId: "prod-1" });
    expect(mockAddItem).toHaveBeenCalledWith("user-1", "prod-1", 1);
  });

  it("retorna 400 para estoque insuficiente", async () => {
    mockAddItem.mockRejectedValue(
      Object.assign(new Error("Estoque insuficiente."), { statusCode: 400 }),
    );
    const res = await request(app)
      .post("/api/carrinho/itens")
      .set("Authorization", token)
      .send({ productId: "prod-1", quantity: 999 });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Estoque insuficiente");
  });

  it("retorna 400 para produto esgotado", async () => {
    mockAddItem.mockRejectedValue(
      Object.assign(new Error('"Laço" está esgotado.'), { statusCode: 400 }),
    );
    const res = await request(app)
      .post("/api/carrinho/itens")
      .set("Authorization", token)
      .send({ productId: "prod-esgotado", quantity: 1 });
    expect(res.status).toBe(400);
  });

  it("retorna 404 para produto inexistente", async () => {
    mockAddItem.mockRejectedValue(
      Object.assign(new Error("Produto não encontrado."), { statusCode: 404 }),
    );
    const res = await request(app)
      .post("/api/carrinho/itens")
      .set("Authorization", token)
      .send({ productId: "nao-existe", quantity: 1 });
    expect(res.status).toBe(404);
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app)
      .post("/api/carrinho/itens")
      .send({ productId: "prod-1", quantity: 1 });
    expect(res.status).toBe(401);
  });
});

// ─── PUT /api/carrinho/itens/:produtoId ──────────────────────
describe("PUT /api/carrinho/itens/:produtoId", () => {
  it("retorna 200 ao atualizar quantidade", async () => {
    mockUpdateItem.mockResolvedValue(
      makeCarrinho([{ productId: "prod-1", quantity: 5 }]) as never,
    );
    const res = await request(app)
      .put("/api/carrinho/itens/prod-1")
      .set("Authorization", token)
      .send({ quantity: 5 });
    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });

  it("chama updateItem com userId, produtoId e quantity corretos", async () => {
    mockUpdateItem.mockResolvedValue(makeCarrinho() as never);
    await request(app)
      .put("/api/carrinho/itens/prod-1")
      .set("Authorization", token)
      .send({ quantity: 3 });
    expect(mockUpdateItem).toHaveBeenCalledWith("user-1", "prod-1", 3);
  });

  it("retorna 200 com carrinho vazio ao setar quantity 0 (remove item)", async () => {
    mockUpdateItem.mockResolvedValue(makeCarrinho() as never);
    const res = await request(app)
      .put("/api/carrinho/itens/prod-1")
      .set("Authorization", token)
      .send({ quantity: 0 });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });

  it("retorna 400 quando quantidade excede o estoque", async () => {
    mockUpdateItem.mockRejectedValue(
      Object.assign(new Error("Estoque insuficiente."), { statusCode: 400 }),
    );
    const res = await request(app)
      .put("/api/carrinho/itens/prod-1")
      .set("Authorization", token)
      .send({ quantity: 999 });
    expect(res.status).toBe(400);
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app)
      .put("/api/carrinho/itens/prod-1")
      .send({ quantity: 2 });
    expect(res.status).toBe(401);
  });
});

// ─── DELETE /api/carrinho/itens/:produtoId ───────────────────
describe("DELETE /api/carrinho/itens/:produtoId", () => {
  it("retorna 200 ao remover item específico", async () => {
    mockRemoveItem.mockResolvedValue(makeCarrinho() as never);
    const res = await request(app)
      .delete("/api/carrinho/itens/prod-1")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });

  it("chama removeItem com userId e produtoId corretos", async () => {
    mockRemoveItem.mockResolvedValue(makeCarrinho() as never);
    await request(app)
      .delete("/api/carrinho/itens/prod-1")
      .set("Authorization", token);
    expect(mockRemoveItem).toHaveBeenCalledWith("user-1", "prod-1");
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app).delete("/api/carrinho/itens/prod-1");
    expect(res.status).toBe(401);
  });
});

// ─── DELETE /api/carrinho ─────────────────────────────────────
describe("DELETE /api/carrinho", () => {
  it("retorna 204 ao limpar o carrinho completamente", async () => {
    mockClear.mockResolvedValue(undefined as never);
    const res = await request(app)
      .delete("/api/carrinho")
      .set("Authorization", token);
    expect(res.status).toBe(204);
  });

  it("chama clear com o userId correto", async () => {
    mockClear.mockResolvedValue(undefined as never);
    await request(app).delete("/api/carrinho").set("Authorization", token);
    expect(mockClear).toHaveBeenCalledWith("user-1");
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app).delete("/api/carrinho");
    expect(res.status).toBe(401);
  });
});
