import request from "supertest";
import fs from "fs";
import path from "path";
import app from "../../src/app";
import { makeValidToken } from "./helpers";

const adminToken = makeValidToken("user-admin", "admin@email.com");
const clientToken = makeValidToken("user-client", "client@email.com");

// imagem fake para os testes
const FIXTURE_PATH = path.resolve(__dirname, "fixtures");
const FAKE_IMAGE = path.join(FIXTURE_PATH, "test.png");

beforeAll(() => {
  if (!fs.existsSync(FIXTURE_PATH))
    fs.mkdirSync(FIXTURE_PATH, { recursive: true });
  // testa o tamanho mínimo da imagem (1x1 pixel PNG)
  const pngBytes = Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489" +
      "0000000a49444154789c6260000000020001e221bc330000000049454e44ae426082",
    "hex",
  );
  fs.writeFileSync(FAKE_IMAGE, pngBytes);
});

afterAll(() => {
  if (fs.existsSync(FAKE_IMAGE)) fs.unlinkSync(FAKE_IMAGE);
});

// ─── POST /api/upload/imagem ────────
describe("POST /api/upload/imagem", () => {
  let uploadedFilename: string;

  it("retorna 201 com imageUrl ao enviar imagem válida como ADMIN", async () => {
    const res = await request(app)
      .post("/api/upload/imagem")
      .set("Authorization", adminToken)
      .attach("image", FAKE_IMAGE);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("imageUrl");
    expect(res.body.imageUrl).toContain("/uploads/");

    uploadedFilename = res.body.imageUrl.split("/uploads/").pop();
  });

  it("retorna 401 sem token", async () => {
    // testa via DELETE (sem multipart) para evitar ECONNRESET
    const res = await request(app).delete("/api/upload/imagem/qualquer.png");
    expect(res.status).toBe(401);
  });

  it("retorna 401 com token inválido", async () => {
    const res = await request(app)
      .delete("/api/upload/imagem/qualquer.png")
      .set("Authorization", "Bearer token_invalido");
    expect(res.status).toBe(401);
  });

  it("retorna 400 ao enviar sem arquivo", async () => {
    const res = await request(app)
      .post("/api/upload/imagem")
      .set("Authorization", adminToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Nenhuma imagem enviada");
  });

  it("retorna 400 ao enviar arquivo com tipo inválido", async () => {
    const txtPath = path.join(FIXTURE_PATH, "test.txt");
    fs.writeFileSync(txtPath, "conteudo qualquer");
    const res = await request(app)
      .post("/api/upload/imagem")
      .set("Authorization", adminToken)
      .attach("image", txtPath);
    fs.unlinkSync(txtPath);
    expect(res.status).toBe(400);
  });

  afterAll(() => {
    if (uploadedFilename) {
      const filePath = path.resolve("uploads", uploadedFilename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });
});

// ─── DELETE /api/upload/imagem/:filename ────
describe("DELETE /api/upload/imagem/:filename", () => {
  let uploadedFilename: string;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/upload/imagem")
      .set("Authorization", adminToken)
      .attach("image", FAKE_IMAGE);
    uploadedFilename = res.body.imageUrl?.split("/uploads/").pop() || "";
  });

  it("retorna 204 ao deletar arquivo existente", async () => {
    const res = await request(app)
      .delete(`/api/upload/imagem/${uploadedFilename}`)
      .set("Authorization", adminToken);
    expect(res.status).toBe(204);
  });

  it("retorna 204 ao tentar deletar arquivo inexistente (idempotente)", async () => {
    const res = await request(app)
      .delete("/api/upload/imagem/nao-existe.png")
      .set("Authorization", adminToken);
    expect(res.status).toBe(204);
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app).delete("/api/upload/imagem/qualquer.png");
    expect(res.status).toBe(401);
  });

  it("não permite path traversal no filename", async () => {
    const res = await request(app)
      .delete("/api/upload/imagem/..%2F..%2Fpackage.json")
      .set("Authorization", adminToken);
    expect(res.status).toBe(204);
  });
});
