import { NavLink, Outlet, Link } from "react-router-dom";
import "./AdminLayout.css";
import "./Admin.css";

const NAV_LINKS = [
  { to: "/admin", label: "Visão Geral", icon: "📊", end: true },
  { to: "/admin/produtos", label: "Produtos", icon: "🎀" },
  { to: "/admin/categorias", label: "Categorias", icon: "🗂" },
  { to: "/admin/pedidos", label: "Pedidos", icon: "📦" },
  { to: "/admin/usuarios", label: "Usuários", icon: "👥" },
];

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-sidebar-brand">
          Painel Admin
        </Link>
        <span className="admin-sidebar-section">Gestão</span>
        {NAV_LINKS.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `admin-sidebar-link${isActive ? " admin-sidebar-link--active" : ""}`
            }
          >
            <span>{icon}</span> {label}
          </NavLink>
        ))}
      </aside>
      <main className="admin-main">
        <div className="admin-main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
