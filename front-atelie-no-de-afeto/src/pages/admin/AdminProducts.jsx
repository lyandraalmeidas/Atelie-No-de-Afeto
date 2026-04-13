import { useNavigate, Link } from "react-router-dom";
import { useCallback } from "react";
import { getProducts, deleteProduct } from "../../services/api";
import { useAdminTable } from "../../hooks/useAdminTable";
import Pagination from "../../components/Pagination";
import FeedbackMessage from "../../components/FeedbackMessage";
import AdminPageHeader from "../../components/AdminPageHeader";

const formatCurrency = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

function AdminProducts() {
  const navigate = useNavigate();
  const fetchProducts = useCallback((p) => getProducts(p, 10), []);

  const { items, meta, setPage, feedback, error, handleDelete } = useAdminTable(
    fetchProducts,
    deleteProduct,
  );

  return (
    <div>
      <AdminPageHeader
        title="Produtos"
        subtitle="Gerencie o catálogo de produtos."
        action={
          <Link
            to="/admin/produtos/novo"
            className="admin-btn admin-btn--primary"
          >
            + Novo Produto
          </Link>
        }
      />
      <FeedbackMessage message={feedback} type="success" />
      <FeedbackMessage message={error} type="error" />
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category?.name || "—"}</td>
                <td>{formatCurrency(p.price)}</td>
                <td>
                  {p.stock === 0 ? (
                    <span className="admin-badge admin-badge--cancelled">
                      Esgotado
                    </span>
                  ) : (
                    p.stock
                  )}
                </td>
                <td
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  <button
                    className="admin-btn admin-btn--ghost"
                    onClick={() => navigate(`/admin/produtos/editar/${p.id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="admin-btn admin-btn--danger"
                    onClick={() => handleDelete(p.id, "Produto removido.")}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-table-empty">
                  Nenhum produto.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
}

export default AdminProducts;
