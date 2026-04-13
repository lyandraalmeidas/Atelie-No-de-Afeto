import { useState } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '../../services/api';
import { useAdminTable } from '../../hooks/useAdminTable';
import Pagination from '../../components/Pagination';
import FeedbackMessage from '../../components/FeedbackMessage';
import PageHeader from '../../components/PageHeader';

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const STATUS_MAP = {
  PENDING:   { label: 'Pendente',   css: 'pending'   },
  CONFIRMED: { label: 'Confirmado', css: 'confirmed' },
  SHIPPED:   { label: 'Enviado',    css: 'shipped'   },
  DELIVERED: { label: 'Entregue',   css: 'delivered' },
  CANCELLED: { label: 'Cancelado',  css: 'cancelled' },
};

// negocio pra deixar o status bonitinho
function StatusBadge({ status }) {
  const { label, css } = STATUS_MAP[status] || { label: status, css: 'pending' };
  return <span className={`admin-badge admin-badge--${css}`}>{label}</span>;
}

function StatusSelector({ order, onUpdate }) {
  const [selected, setSelected] = useState(order.status);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (selected === order.status) return;
    setLoading(true);
    await onUpdate(order.id, selected);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <select
        className="form-select form-select-sm"
        style={{ width: 'auto', borderRadius: 12, fontSize: '0.85rem' }}
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {Object.entries(STATUS_MAP).map(([key, { label }]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
      <button
        className="admin-btn admin-btn--primary"
        style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem' }}
        onClick={handleConfirm}
        disabled={loading || selected === order.status}
      >
        {loading ? '…' : 'OK'}
      </button>
    </div>
  );
}

function AdminOrders() {
  const { items, meta, setPage, feedback, error, handleDelete, reload } =
    useAdminTable(getOrders, deleteOrder);

  const handleStatusUpdate = async (id, status) => {
    await updateOrderStatus(id, status);
    reload();
  };

  return (
    <div>
      <PageHeader title="Pedidos" subtitle="Gerencie e atualize o status dos pedidos." />
      <FeedbackMessage message={feedback} type="success" />
      <FeedbackMessage message={error} type="error" />
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Cliente</th><th>Total</th><th>Status</th><th>Atualizar</th><th>Ação</th></tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.id.slice(0, 8)}…</td>
                <td>{o.user?.name || '—'}</td>
                <td>{formatCurrency(o.total)}</td>
                <td><StatusBadge status={o.status} /></td>
                <td><StatusSelector order={o} onUpdate={handleStatusUpdate} /></td>
                <td>
                  <button className="admin-btn admin-btn--danger"
                    onClick={() => handleDelete(o.id, 'Pedido removido.')}>
                    Remover
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="admin-table-empty">Nenhum pedido encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
}

export default AdminOrders;