import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useCallback } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";

import Menu from "../components/Menu";
import Home from "../pages/Home";
import Products from "../pages/Products";
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";

import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminProductForm from "../pages/admin/AdminProductForm";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminCategoryForm from "../pages/admin/AdminCategoryForm";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminUsers from "../pages/admin/AdminUsers";

import "./App.css";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Menu />
      <main>
        <Routes>
          {/* ─── aqui entra qualquer um  ─── */}
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />

          {/* ─── aqui entra só quem tá logado ──── */}
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* ─── aqui entra só admin ────── */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="produtos" element={<AdminProducts />} />
            <Route path="produtos/novo" element={<AdminProductForm />} />
            <Route path="produtos/editar/:id" element={<AdminProductForm />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="categorias/novo" element={<AdminCategoryForm />} />
            <Route
              path="categorias/editar/:id"
              element={<AdminCategoryForm />}
            />
            <Route path="pedidos" element={<AdminOrders />} />
            <Route path="usuarios" element={<AdminUsers />} />
          </Route>
        </Routes>
      </main>
      <SiteFooter />
    </>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h3>Ateliê Nós de Afeto</h3>
          <p>
            Peças artesanais criadas com carinho para celebrar afetos e memórias
            especiais.
          </p>
        </div>
        <div>
          <h4>Contato</h4>
          <p>contato@nosdeafeto.com</p>
          <p>+55 44 98765-4321</p>
        </div>
        <div>
          <h4>Endereço</h4>
          <p>Rua Aparecida Fit</p>
          <p>Bairro Águas de Jurema, Iretama - PR</p>
        </div>
        <div>
          <h4>Links úteis</h4>
          <p>
            <a href="/products">Produtos</a>
          </p>
          <p>
            <a href="/register">Cadastro</a>
          </p>
        </div>
      </div>
      <div className="footer-copy">
        © {new Date().getFullYear()} Ateliê Nós de Afeto. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}

function App() {
  const [cartKey, setCartKey] = useState(0);
  const handleLogout = useCallback(() => setCartKey((k) => k + 1), []);

  return (
    <Router>
      <AuthProvider onLogout={handleLogout}>
        <CartProvider key={cartKey}>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
