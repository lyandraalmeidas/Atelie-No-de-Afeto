import { OrderStatus, Role } from '@prisma/client';

// ─── Pagination ───────────────────────────────────────────────
export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Auth ─────────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserPublic;
}

// ─── User ─────────────────────────────────────────────────────
export interface UserPublic {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string | null;
  role: Role;
  createdAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateUserInput {
  name: string;
  cpf: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

// ─── Category ─────────────────────────────────────────────────
export interface CreateCategoryInput { name: string }
export interface UpdateCategoryInput { name: string }

// ─── Product ──────────────────────────────────────────────────
export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: string;
}

export interface UpdateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: string;
}

// ─── Order ────────────────────────────────────────────────────
export interface OrderItemInput { productId: string; quantity: number }
export interface CreateOrderInput { items: OrderItemInput[] }
export interface UpdateOrderStatusInput { status: OrderStatus }

// ─── Express augmentation ─────────────────────────────────────
export { Role };

declare global {
  namespace Express {
    interface Request {
      userId: string;
      userEmail: string;
      userRole: Role;
    }
  }
}