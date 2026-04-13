import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getOrders, getUsers, getCategories } from '../../services/api';
import AdminPageHeader from '../../components/AdminPageHeader';

const STATS = [
  { key: 'products',   label: 'Produtos', to: '/admin/produtos'   },
  { key: 'categories', label: 'Categorias', to: '/admin/categorias' },
  { key: 'orders',     label: 'Pedidos',    to: '/admin/pedidos'     },
  { key: 'users',      label: 'Usuários',   to: '/admin/usuarios'      },
];

function StatCard({ icon, label, count, to, loading }) {
  return (
    <Link to={to} className="admin-stat-card">
      <span className="admin-stat-icon">{icon}</span>
      <span className="admin-stat-value">{loading ? '…' : count}</span>
      <span className="admin-stat-label">{label}</span>
    </Link>
  );
}

function AdminDashboard() {
  const [counts, setCounts] = useState({ products: 0, categories: 0, orders: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(1, 1), getCategories(1), getOrders(1), getUsers(1)])
      .then(([p, c, o, u]) => setCounts({
        products: p.meta.total,
        categories: c.meta.total,
        orders: o.meta.total,
        users: u.meta.total,
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <AdminPageHeader title="Visão Geral" subtitle="Resumo da plataforma em tempo real." />
      <div className="admin-dashboard-grid">
        {STATS.map(({ key, label, icon, to }) => (
          <StatCard key={key} label={label} icon={icon} to={to} count={counts[key]} loading={loading} />
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;