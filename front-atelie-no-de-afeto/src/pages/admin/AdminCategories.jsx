import { useNavigate, Link } from "react-router-dom";
import { getCategories, deleteCategory } from "../../services/api";
import { useAdminTable } from "../../hooks/useAdminTable";
import Pagination from "../../components/Pagination";
import FeedbackMessage from "../../components/FeedbackMessage";
import PageHeader from "../../components/PageHeader";

function AdminCategories() {
  const navigate = useNavigate();
  const { items, meta, setPage, feedback, error, handleDelete } = useAdminTable(
    getCategories,
    deleteCategory,
  );

  return (
    <div>
      <PageHeader
        title="Categorias"
        subtitle="Organize os produtos por categoria."
        action={
          <Link
            to="/admin/categorias/novo"
            className="admin-btn admin-btn--primary"
          >
            + Nova Categoria
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
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{new Date(c.createdAt).toLocaleDateString("pt-BR")}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="admin-btn admin-btn--ghost"
                    onClick={() => navigate(`/admin/categorias/editar/${c.id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="admin-btn admin-btn--danger"
                    onClick={() => handleDelete(c.id, "Categoria removida.")}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="admin-table-empty">
                  Nenhuma categoria.
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

export default AdminCategories;
