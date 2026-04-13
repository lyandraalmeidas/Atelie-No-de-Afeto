import { ProductService } from "../../../src/services/product.service";
import { ProductRepository } from "../../../src/repositories/product.repository";
import { CategoryRepository } from "../../../src/repositories/category.repository";

jest.mock("../../../src/repositories/product.repository");
jest.mock("../../../src/repositories/category.repository");

const MockProductRepository = ProductRepository as jest.MockedClass<
  typeof ProductRepository
>;
const MockCategoryRepository = CategoryRepository as jest.MockedClass<
  typeof CategoryRepository
>;

const mockCategory = {
  id: "cat-1",
  name: "Laços",
  createdAt: new Date(),
  updatedAt: new Date(),
  products: [],
};

const mockProduct = {
  id: "prod-uuid-1",
  name: "Laço de Seda",
  description: "Laço artesanal macio",
  price: 39.9,
  stock: 20,
  categoryId: "cat-1",
  category: mockCategory,
  createdAt: new Date(),
  updatedAt: new Date(),
  orderItems: [],
};

const validInput = {
  name: "Laço de Seda",
  description: "Laço artesanal macio",
  price: 39.9,
  stock: 20,
  categoryId: "cat-1",
};

describe("ProductService", () => {
  let productService: ProductService;
  let productRepoMock: jest.Mocked<ProductRepository>;
  let categoryRepoMock: jest.Mocked<CategoryRepository>;

  beforeEach(() => {
    MockProductRepository.mockClear();
    MockCategoryRepository.mockClear();
    productService = new ProductService();
    productRepoMock = MockProductRepository.mock
      .instances[0] as jest.Mocked<ProductRepository>;
    categoryRepoMock = MockCategoryRepository.mock
      .instances[0] as jest.Mocked<CategoryRepository>;
  });

  // --- findById ---
  describe("findById", () => {
    it("deve retornar produto existente", async () => {
      productRepoMock.findById = jest.fn().mockResolvedValue(mockProduct);
      const result = await productService.findById("prod-uuid-1");
      expect(result).toEqual(mockProduct);
    });

    it("deve lançar 404 para produto inexistente", async () => {
      productRepoMock.findById = jest.fn().mockResolvedValue(null);
      await expect(productService.findById("nao-existe")).rejects.toMatchObject(
        { statusCode: 404 },
      );
    });
  });

  // --- create ---
  describe("create", () => {
    it("deve criar produto com dados válidos", async () => {
      categoryRepoMock.findById = jest.fn().mockResolvedValue(mockCategory);
      productRepoMock.create = jest.fn().mockResolvedValue(mockProduct);

      const result = await productService.create(validInput);
      expect(result).toEqual(mockProduct);
    });

    it("deve lançar 400 para nome vazio", async () => {
      await expect(
        productService.create({ ...validInput, name: "" }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Nome do produto é obrigatório.",
      });
    });

    it("deve lançar 400 para preço zero", async () => {
      await expect(
        productService.create({ ...validInput, price: 0 }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Preço deve ser maior que zero.",
      });
    });

    it("deve lançar 400 para estoque negativo", async () => {
      await expect(
        productService.create({ ...validInput, stock: -5 }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Estoque não pode ser negativo.",
      });
    });

    it("deve lançar 400 para descrição vazia", async () => {
      await expect(
        productService.create({ ...validInput, description: "" }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Descrição é obrigatória.",
      });
    });

    it("deve lançar 404 se categoria não existe", async () => {
      categoryRepoMock.findById = jest.fn().mockResolvedValue(null);
      await expect(productService.create(validInput)).rejects.toMatchObject({
        statusCode: 404,
        message: "Categoria não encontrada.",
      });
    });
  });

  // --- update ---
  describe("update", () => {
    it("deve atualizar produto existente", async () => {
      productRepoMock.findById = jest.fn().mockResolvedValue(mockProduct);
      categoryRepoMock.findById = jest.fn().mockResolvedValue(mockCategory);
      productRepoMock.update = jest
        .fn()
        .mockResolvedValue({ ...mockProduct, name: "Laço Premium" });

      const result = await productService.update("prod-uuid-1", {
        ...validInput,
        name: "Laço Premium",
      });
      expect(result.name).toBe("Laço Premium");
    });

    it("deve lançar 404 ao atualizar produto inexistente", async () => {
      productRepoMock.findById = jest.fn().mockResolvedValue(null);
      await expect(
        productService.update("nao-existe", validInput),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // --- delete ---
  describe("delete", () => {
    it("deve deletar produto existente", async () => {
      productRepoMock.findById = jest.fn().mockResolvedValue(mockProduct);
      productRepoMock.delete = jest.fn().mockResolvedValue(undefined);

      await expect(
        productService.delete("prod-uuid-1"),
      ).resolves.toBeUndefined();
    });

    it("deve lançar 404 ao deletar produto inexistente", async () => {
      productRepoMock.findById = jest.fn().mockResolvedValue(null);
      await expect(productService.delete("nao-existe")).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
