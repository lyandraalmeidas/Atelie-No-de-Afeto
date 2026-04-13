import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form } from "react-bootstrap";
import {
  createProduct,
  updateProduct,
  getAllCategories,
  getProducts,
} from "../../services/api";
import { useForm } from "../../hooks/useForm";
import FeedbackMessage from "../../components/FeedbackMessage";
import PageHeader from "../../components/PageHeader";

const API = process.env.REACT_APP_API_URL || "http://localhost:3333/api";
const EMPTY = {
  name: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  categoryId: "",
};

function validate(values) {
  const e = {};
  if (!values.name.trim()) e.name = "Obrigatório.";
  if (!values.description.trim()) e.description = "Obrigatório.";
  if (!values.price || Number(values.price) <= 0)
    e.price = "Deve ser maior que zero.";
  if (values.stock === "" || Number(values.stock) < 0)
    e.stock = "Não pode ser negativo.";
  if (!values.categoryId) e.categoryId = "Selecione uma categoria.";
  return e;
}

async function uploadImageFile(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${API}/upload/imagem`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Erro ao enviar imagem.");
  }
  const data = await res.json();
  return data.imageUrl;
}

async function deleteOldImage(imageUrl) {
  if (!imageUrl) return;
  try {
    const filename = imageUrl.split("/uploads/").pop();
    if (!filename) return;
    await fetch(`${API}/upload/imagem/${filename}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  } catch {}
}

function ImageUploader({ currentUrl, onUrlChange }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(currentUrl || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    setPreview(currentUrl || "");
  }, [currentUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      // remove imagem antiga se existir
      await deleteOldImage(currentUrl);
      const url = await uploadImageFile(file);
      setPreview(url);
      onUrlChange(url);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = async () => {
    await deleteOldImage(currentUrl);
    setPreview("");
    onUrlChange("");
  };

  return (
    <div className="image-uploader">
      {preview ? (
        <div className="image-uploader-preview">
          <img src={preview} alt="Preview do produto" />
          <div className="image-uploader-overlay">
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Enviando..." : "✏️ Trocar"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              onClick={handleRemove}
            >
              🗑 Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="image-uploader-placeholder"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Enviando..." : "📷 Adicionar imagem"}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {uploadError && <p className="image-uploader-error">{uploadError}</p>}
      <p className="image-uploader-hint">JPG, PNG, WEBP ou GIF · máx. 5 MB</p>
    </div>
  );
}

function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const form = useForm(EMPTY, validate);
  const [categories, setCategories] = useState([]);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    getAllCategories()
      .then((r) => setCategories(r.data))
      .catch(() => {});
    if (!isEdit) return;
    getProducts(1, 100)
      .then((r) => {
        const product = r.data.find((p) => p.id === id);
        if (!product) {
          navigate("/admin/produtos");
          return;
        }
        form.setValues({
          name: product.name,
          description: product.description,
          price: String(product.price),
          stock: String(product.stock),
          imageUrl: product.imageUrl || "",
          categoryId: product.categoryId,
        });
      })
      .catch(() => navigate("/admin/produtos"))
      .finally(() => setFetching(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await form.submit(async (values) => {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        stock: Number(values.stock),
        categoryId: values.categoryId,
        ...(values.imageUrl ? { imageUrl: values.imageUrl } : {}),
      };
      if (isEdit) await updateProduct(id, payload);
      else await createProduct(payload);
      navigate("/admin/produtos");
    });
  };

  const set = (field) => (e) =>
    form.setValues((p) => ({ ...p, [field]: e.target.value }));
  const f = form.values;

  if (fetching)
    return (
      <p style={{ padding: "2rem", color: "var(--text-muted)" }}>
        Carregando...
      </p>
    );

  return (
    <div>
      <PageHeader
        title={isEdit ? "Editar Produto" : "Novo Produto"}
        subtitle={
          isEdit
            ? "Atualize os dados do produto."
            : "Preencha os dados para adicionar ao catálogo."
        }
      />
      <div className="admin-form-card">
        <Form onSubmit={handleSubmit} noValidate>
          {/* upload de imagem */}
          <Form.Group className="mb-4">
            <Form.Label>Imagem do Produto</Form.Label>
            <ImageUploader
              currentUrl={f.imageUrl}
              onUrlChange={(url) =>
                form.setValues((p) => ({ ...p, imageUrl: url }))
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nome *</Form.Label>
            <Form.Control
              value={f.name}
              onChange={set("name")}
              isInvalid={!!form.errors.name}
              placeholder="Ex: Laço de Seda"
            />
            <Form.Control.Feedback type="invalid">
              {form.errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrição *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={f.description}
              onChange={set("description")}
              isInvalid={!!form.errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {form.errors.description}
            </Form.Control.Feedback>
          </Form.Group>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>Preço (R$) *</Form.Label>
              <Form.Control
                type="number"
                min="0.01"
                step="0.01"
                value={f.price}
                onChange={set("price")}
                isInvalid={!!form.errors.price}
                placeholder="0,00"
              />
              <Form.Control.Feedback type="invalid">
                {form.errors.price}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estoque *</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={f.stock}
                onChange={set("stock")}
                isInvalid={!!form.errors.stock}
                placeholder="0"
              />
              <Form.Control.Feedback type="invalid">
                {form.errors.stock}
              </Form.Control.Feedback>
            </Form.Group>
          </div>

          <Form.Group className="mb-4">
            <Form.Label>Categoria *</Form.Label>
            <Form.Select
              value={f.categoryId}
              onChange={set("categoryId")}
              isInvalid={!!form.errors.categoryId}
            >
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {form.errors.categoryId}
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
                  ? "Atualizar Produto"
                  : "Salvar Produto"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => navigate("/admin/produtos")}
            >
              Cancelar
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default AdminProductForm;
