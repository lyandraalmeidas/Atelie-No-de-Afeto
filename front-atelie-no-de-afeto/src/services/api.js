const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333/api';

const getToken = () => localStorage.getItem('token');

const buildHeaders = (withAuth) => ({
  'Content-Type': 'application/json',
  ...(withAuth && getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const request = async (method, path, body = null, withAuth = false) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(withAuth),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Erro na requisição.');
  return data;
};

// ─── Auth ───
export const login = (email, password) =>
  request('POST', '/auth/login', { email, password });

export const register = (data) =>
  request('POST', '/auth/register', data);

// ─── Usuários ─────
export const getUsers = (page = 1) =>
  request('GET', `/users?page=${page}&limit=10`, null, true);

export const updateUser = (id, data) =>
  request('PUT', `/users/${id}`, data, true);

// ─── Categorias ───────
export const getCategories = (page = 1) =>
  request('GET', `/categories?page=${page}&limit=10`, null, true);

export const getAllCategories = () =>
  request('GET', '/categories?page=1&limit=100', null, true);

export const createCategory = (data) =>
  request('POST', '/categories', data, true);

export const updateCategory = (id, data) =>
  request('PUT', `/categories/${id}`, data, true);

export const deleteCategory = (id) =>
  request('DELETE', `/categories/${id}`, null, true);

// ─── Produtos ───────────
export const getProducts = (page = 1, limit = 10) =>
  request('GET', `/products?page=${page}&limit=${limit}`, null, false);

export const createProduct = (data) =>
  request('POST', '/products', data, true);

export const updateProduct = (id, data) =>
  request('PUT', `/products/${id}`, data, true);

export const deleteProduct = (id) =>
  request('DELETE', `/products/${id}`, null, true);

// ─── Pedidos ───────
export const getOrders = (page = 1) =>
  request('GET', `/orders?page=${page}&limit=10`, null, true);

export const updateOrderStatus = (id, status) =>
  request('PATCH', `/orders/${id}/status`, { status }, true);

export const deleteOrder = (id) =>
  request('DELETE', `/orders/${id}`, null, true);