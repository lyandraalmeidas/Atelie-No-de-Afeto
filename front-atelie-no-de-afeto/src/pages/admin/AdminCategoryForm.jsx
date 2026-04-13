import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form } from "react-bootstrap";
import {
  createCategory,
  updateCategory,
  getCategories,
} from "../../services/api";
import { useForm } from "../../hooks/useForm";
import FeedbackMessage from "../../components/FeedbackMessage";
import AdminPageHeader from "../../components/AdminPageHeader";

const validate = (values) =>
  values.name?.trim() ? {} : { name: "Nome é obrigatório." };

function AdminCategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const form = useForm({ name: "" }, validate);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getCategories(1)
      .then((r) => {
        const cat = r.data.find((c) => c.id === id);
        if (!cat) {
          navigate("/admin/categorias");
          return;
        }
        form.setValues({ name: cat.name });
      })
      .catch(() => navigate("/admin/categorias"))
      .finally(() => setFetching(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await form.submit(async (values) => {
      if (isEdit) await updateCategory(id, { name: values.name.trim() });
      else await createCategory({ name: values.name.trim() });
      navigate("/admin/categorias");
    });
  };

  if (fetching)
    return (
      <p style={{ padding: "2rem", color: "var(--text-muted)" }}>
        Carregando...
      </p>
    );

  return (
    <div>
      <AdminPageHeader
        title={isEdit ? "Editar Categoria" : "Nova Categoria"}
        subtitle={
          isEdit
            ? "Atualize o nome da categoria."
            : "Crie uma categoria para organizar os produtos."
        }
      />
      <div className="admin-form-card">
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-4">
            <Form.Label>Nome da Categoria *</Form.Label>
            <Form.Control
              value={form.values.name}
              onChange={(e) => form.setValues({ name: e.target.value })}
              isInvalid={!!form.errors.name}
              placeholder="Ex: Laços, Kits, Acessórios"
            />
            <Form.Control.Feedback type="invalid">
              {form.errors.name}
            </Form.Control.Feedback>
          </Form.Group>
          <FeedbackMessage message={form.apiError} type="error" />
          <div className="admin-form-actions">
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={form.loading}
            >
              {form.loading
                ? "Salvando…"
                : isEdit
                  ? "Atualizar Categoria"
                  : "Salvar Categoria"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => navigate("/admin/categorias")}
            >
              Cancelar
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default AdminCategoryForm;
