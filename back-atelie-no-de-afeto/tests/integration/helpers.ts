import { Decimal } from "@prisma/client/runtime/library";
import { OrderStatus, Role } from "@prisma/client";
import { signToken } from "../../src/utils/jwt";

export const makeMockUser = (overrides = {}) => ({
  id: "user-uuid-1",
  name: "Ana Silva",
  email: "ana@email.com",
  cpf: "52998224725",
  phone: null,
  role: "CLIENT" as Role,
  createdAt: new Date(),
  ...overrides,
});

export const makeMockCategory = (overrides = {}) => ({
  id: "cat-uuid-1",
  name: "Laços",
  createdAt: new Date(),
  updatedAt: new Date(),
  products: [],
  ...overrides,
});

export const makeMockProduct = (overrides = {}) => ({
  id: "prod-uuid-1",
  name: "Laço de Seda",
  description: "Laço artesanal macio",
  price: new Decimal(39.9),
  stock: 20,
  imageUrl: null,
  categoryId: "cat-uuid-1",
  category: makeMockCategory(),
  orderItems: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const makeMockOrder = (overrides = {}) => ({
  id: "order-uuid-1",
  userId: "user-uuid-1",
  status: "PENDING" as OrderStatus,
  total: new Decimal(39.9),
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: "user-uuid-1", name: "Ana Silva", email: "ana@email.com" },
  items: [],
  ...overrides,
});

export const makeValidToken = (
  userId = "user-uuid-1",
  email = "ana@email.com",
) => `Bearer ${signToken({ userId, email, role: "ADMIN" as Role })}`;
