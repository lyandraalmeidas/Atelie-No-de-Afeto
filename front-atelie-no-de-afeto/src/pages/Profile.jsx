import { Form, Container } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { updateUser } from "../services/api";
import {
  isValidCpf,
  cleanCpf,
  isValidPassword,
  passwordStrengthMessage,
} from "../utils/validators";
import { useForm } from "../hooks/useForm";
import { usePasswordToggle } from "../hooks/usePasswordToggle";
import FeedbackMessage from "../components/FeedbackMessage";
import "./Profile.css";

function validate(values) {
  const e = {};
  if (!values.name.trim()) e.name = "Nome é obrigatório.";
  if (!isValidCpf(values.cpf)) e.cpf = "CPF inválido.";
  if (values.password && !isValidPassword(values.password))
    e.password = passwordStrengthMessage;
  if (values.password && values.password !== values.confirmPassword)
    e.confirmPassword = "As senhas não conferem.";
  return e;
}

function PasswordField({ label, name, value, onChange, error, placeholder }) {
  const [show, toggle, inputType] = usePasswordToggle();
  return (
    <Form.Group className="mb-4">
      <Form.Label>{label}</Form.Label>
      <div className="input-eye-wrapper">
        <Form.Control
          className="form-input"
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          isInvalid={!!error}
          placeholder={placeholder}
        />
        <button type="button" className="eye-btn" onClick={toggle}>
          {show ? "🙈" : "👁️"}
        </button>
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      </div>
    </Form.Group>
  );
}

function Profile() {
  const { user, refreshUser } = useAuth();
  const form = useForm(
    {
      name: user?.name || "",
      cpf: user?.cpf || "",
      phone: user?.phone || "",
      password: "",
      confirmPassword: "",
    },
    validate,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await form.submit(async (values) => {
      const payload = {
        name: values.name,
        cpf: cleanCpf(values.cpf),
        phone: values.phone,
        ...(values.password
          ? {
              password: values.password,
              confirmPassword: values.confirmPassword,
            }
          : {}),
      };
      const res = await updateUser(user.id, payload);
      refreshUser(res.user);
      form.setSuccess("Perfil atualizado com sucesso!");
      form.setValues((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    });
    void ok;
  };

  const f = form.values;
  const set = (name) => (e) =>
    form.setValues((p) => ({ ...p, [name]: e.target.value }));

  return (
    <div className="profile-page">
      <Container className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-title">Meu Perfil</h2>
          <p className="profile-subtitle">Atualize suas informações pessoais</p>

          <div className="profile-email-block">
            <span className="profile-email-label"> E-mail</span>
            <span className="profile-email-value">{user?.email}</span>
            <span
              className="profile-email-lock"
              title="E-mail não pode ser alterado"
            >
              🔒
            </span>
          </div>

          <Form onSubmit={handleSubmit} noValidate className="profile-form">
            <Form.Group className="mb-4">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                className="form-input"
                name="name"
                value={f.name}
                onChange={set("name")}
                isInvalid={!!form.errors.name}
                placeholder="Seu nome completo"
              />
              <Form.Control.Feedback type="invalid">
                {form.errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>CPF</Form.Label>
              <Form.Control
                className="form-input"
                name="cpf"
                value={f.cpf}
                onChange={set("cpf")}
                isInvalid={!!form.errors.cpf}
                placeholder="Somente números"
              />
              <Form.Control.Feedback type="invalid">
                {form.errors.cpf}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Telefone</Form.Label>
              <Form.Control
                className="form-input"
                name="phone"
                type="tel"
                value={f.phone}
                onChange={set("phone")}
                placeholder="(00) 00000-0000"
              />
            </Form.Group>

            <div className="profile-section-divider">
              <span>Alterar senha</span>
            </div>
            <p className="profile-hint">
              Deixe em branco para manter a senha atual.
            </p>

            <PasswordField
              label="Nova Senha"
              name="password"
              value={f.password}
              onChange={set("password")}
              error={form.errors.password}
              placeholder="Mín. 8 caracteres, maiúscula e número"
            />

            <PasswordField
              label="Confirmar Senha"
              name="confirmPassword"
              value={f.confirmPassword}
              onChange={set("confirmPassword")}
              error={form.errors.confirmPassword}
              placeholder="Repita a nova senha"
            />

            <FeedbackMessage message={form.apiError} type="error" />
            <FeedbackMessage message={form.success} type="success" />

            <button
              type="submit"
              className="form-page-button profile-submit-btn"
              disabled={form.loading}
            >
              {form.loading ? "Salvando..." : "Salvar alterações"}
            </button>
          </Form>
        </div>
      </Container>
    </div>
  );
}

export default Profile;
