import { getUsers } from "../../services/api";
import { useAdminTable } from "../../hooks/useAdminTable";
import Pagination from "../../components/Pagination";
import FeedbackMessage from "../../components/FeedbackMessage";
import PageHeader from "../../components/PageHeader";

function RoleBadge({ role }) {
  //se não for admin, automaticamente é cliente
  return (
    <span
      className={`admin-badge ${role === "ADMIN" ? "admin-badge--confirmed" : "admin-badge--cancelled"}`}
    >
      {role === "ADMIN" ? "Admin" : "Cliente"}
    </span>
  );
}

function AdminUsers() {
  // essa listagem de usuários é só para leitura, sem edição
  const { items, meta, setPage, error } = useAdminTable(getUsers, () =>
    Promise.resolve(),
  );

  return (
    <div>
      <PageHeader
        title="Usuários"
        subtitle="Visualize os usuários cadastrados na plataforma."
      />
      <FeedbackMessage message={error} type="error" />
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>CPF</th>
              <th>Perfil</th>
              <th>Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.cpf}</td>
                <td>
                  <RoleBadge role={u.role} />
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-table-empty">
                  Nenhum usuário encontrado.
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

export default AdminUsers;
