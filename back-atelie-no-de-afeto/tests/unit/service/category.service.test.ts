import { CategoryService } from "../../../src/services/category.service";
import { CategoryRepository } from "../../../src/repositories/category.repository";

jest.mock("../../../src/repositories/category.repository.ts");

const MockCategoryRepository = CategoryRepository as jest.MockedClass<
  typeof CategoryRepository
>;

const mockCategory = {
  id: "cat-uuid-1",
  name: "Laços",
  createdAt: new Date(),
  updatedAt: new Date(),
  products: [],
};

describe("CategoryService", () => {
  let categoryService: CategoryService;
  let categoryRepoMock: jest.Mocked<CategoryRepository>;

  beforeEach(() => {
    MockCategoryRepository.mockClear();
    categoryService = new CategoryService();
    categoryRepoMock = MockCategoryRepository.mock
      .instances[0] as jest.Mocked<CategoryRepository>;
  });

  // --- findById ---
  describe("findById", () => {
    it("deve retornar categoria existente", async () => {
      categoryRepoMock.findById = jest.fn().mockResolvedValue(mockCategory);
      const result = await categoryService.findById("cat-uuid-1");
      expect(result).toEqual(mockCategory);
    });

    it("deve lançar 404 para categoria inexistente", async () => {
      categoryRepoMock.findById = jest.fn().mockResolvedValue(null);
      await expect(
        categoryService.findById("nao-existe"),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Categoria não encontrada.",
      });
    });
  });

  // --- create ---
  describe("create", () => {
    it("deve criar categoria com nome válido", async () => {
      categoryRepoMock.findByName = jest.fn().mockResolvedValue(null);
      categoryRepoMock.create = jest.fn().mockResolvedValue(mockCategory);

      const result = await categoryService.create({ name: "Laços" });
      expect(result).toEqual(mockCategory);
      expect(categoryRepoMock.create).toHaveBeenCalledWith({ name: "Laços" });
    });

    it("deve lançar 400 para nome vazio", async () => {
      await expect(categoryService.create({ name: "" })).rejects.toMatchObject({
        statusCode: 400,
        message: "Nome da categoria é obrigatório.",
      });
    });

    it("deve lançar 409 se nome já existe", async () => {
      categoryRepoMock.findByName = jest.fn().mockResolvedValue(mockCategory);
      await expect(
        categoryService.create({ name: "Laços" }),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "Já existe uma categoria com esse nome.",
      });
    });
  });

  // --- update ---
  describe("update", () => {
    it("deve atualizar categoria existente", async () => {
      categoryRepoMock.findById = jest.fn().mockResolvedValue(mockCategory);
      categoryRepoMock.findByName = jest.fn().mockResolvedValue(null);
      categoryRepoMock.update = jest
        .fn()
        .mockResolvedValue({ ...mockCategory, name: "Acessórios" });

      const result = await categoryService.update("cat-uuid-1", {
        name: "Acessórios",
      });
      expect(result.name).toBe("Acessórios");
    });

    it("deve lançar 404 ao atualizar categoria inexistente", async () => {
      categoryRepoMock.findById = jest.fn().mockResolvedValue(null);
      await expect(
        categoryService.update("nao-existe", { name: "Qualquer" }),
      ).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("deve lançar 400 para nome vazio na atualização", async () => {
      categoryRepoMock.findById = jest.fn().mockResolvedValue(mockCategory);
      await expect(
        categoryService.update("cat-uuid-1", { name: "  " }),
      ).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("deve lançar 409 se novo nome já pertence a outra categoria", async () => {
      categoryRepoMock.findById = jest.fn().mockResolvedValue(mockCategory);
      categoryRepoMock.findByName = jest
        .fn()
        .mockResolvedValue({ ...mockCategory, id: "outro-id" });

      await expect(
        categoryService.update("cat-uuid-1", { name: "Laços" }),
      ).rejects.toMatchObject({
        statusCode: 409,
      });
    });

    it("deve permitir atualizar mantendo o mesmo nome", async () => {
      categoryRepoMock.findById = jest.fn().mockResolvedValue(mockCategory);
      categoryRepoMock.findByName = jest.fn().mockResolvedValue(mockCategory);
      categoryRepoMock.update = jest.fn().mockResolvedValue(mockCategory);

      await expect(
        categoryService.update("cat-uuid-1", { name: "Laços" }),
      ).resolves.toBeDefined();
    });
  });

  // --- delete ---
  describe("delete", () => {
    it("deve deletar categoria existente", async () => {
      categoryRepoMock.findById = jest.fn().mockResolvedValue(mockCategory);
      categoryRepoMock.delete = jest.fn().mockResolvedValue(undefined);

      await expect(
        categoryService.delete("cat-uuid-1"),
      ).resolves.toBeUndefined();
      expect(categoryRepoMock.delete).toHaveBeenCalledWith("cat-uuid-1");
    });

    it("deve lançar 404 ao deletar categoria inexistente", async () => {
      categoryRepoMock.findById = jest.fn().mockResolvedValue(null);
      await expect(categoryService.delete("nao-existe")).rejects.toMatchObject({
        statusCode: 404,
        message: "Categoria não encontrada.",
      });
    });
  });

  // --- findAll ------─
  describe("findAll", () => {
    it("deve retornar resultado paginado", async () => {
      const paginatedResult = {
        data: [mockCategory],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      categoryRepoMock.findAll = jest.fn().mockResolvedValue(paginatedResult);

      const result = await categoryService.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
