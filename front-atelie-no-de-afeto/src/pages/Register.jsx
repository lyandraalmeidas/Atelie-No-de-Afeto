import { Link, useNavigate } from "react-router-dom";
import { Form, Container } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import {
  isValidEmail,
  isValidCpf,
  cleanCpf,
  isValidPassword,
  passwordStrengthMessage,
} from "../utils/validators";
import { useForm } from "../hooks/useForm";
import { usePasswordToggle } from "../hooks/usePasswordToggle";
import FeedbackMessage from "../components/FeedbackMessage";
import "./Register.css";
import "./Profile.css";

const INITIAL = {
  name: "",
  cpf: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

function validate(values) {
  const e = {};
  if (!values.name.trim()) e.name = "Informe seu nome.";
  if (!isValidEmail(values.email)) e.email = "E-mail inválido.";
  if (!isValidCpf(values.cpf)) e.cpf = "CPF inválido.";
  if (!values.phone.trim()) e.phone = "Informe seu telefone.";
  if (!isValidPassword(values.password)) e.password = passwordStrengthMessage;
  if (values.password !== values.confirmPassword)
    e.confirmPassword = "As senhas não conferem.";
  if (!values.acceptTerms) e.acceptTerms = "Aceite os termos de uso.";
  return e;
}

function Register() {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const form = useForm(INITIAL, validate);
  const [showPwd, togglePwd, pwdType] = usePasswordToggle();
  const [showConfirm, toggleConfirm, confirmType] = usePasswordToggle();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await form.submit(async (values) => {
      await register({
        name: values.name,
        email: values.email,
        cpf: cleanCpf(values.cpf),
        phone: values.phone,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      // login automatico depois de cadastrar
      await login(values.email, values.password);
    });
    if (ok) navigate("/");
  };

  const f = form.values;

  return (
    <Container className="form-page-container">
      <div className="form-page-wrapper">
        <div className="form-page-top">
          <h1 className="form-page-title">Criar Conta</h1>
          <p className="form-page-subtitle">
            Seu espaço de carinho começa aqui.
          </p>
        </div>

        <Form className="form-page-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <Form.Group className="mb-4 form-col">
              <Form.Label>Nome *</Form.Label>
              <Form.Control
                className="form-input"
                name="name"
                placeholder="Nome completo"
                value={f.name}
                onChange={form.handleChange}
                isInvalid={!!form.errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {form.errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-4 form-col">
              <Form.Label>CPF *</Form.Label>
              <Form.Control
                className="form-input"
                name="cpf"
                placeholder="Somente números"
                value={f.cpf}
                onChange={form.handleChange}
                isInvalid={!!form.errors.cpf}
              />
              <Form.Control.Feedback type="invalid">
                {form.errors.cpf}
              </Form.Control.Feedback>
            </Form.Group>
          </div>

          <Form.Group className="mb-4">
            <Form.Label>E-mail *</Form.Label>
            <Form.Control
              className="form-input"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={f.email}
              onChange={form.handleChange}
              isInvalid={!!form.errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {form.errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Telefone *</Form.Label>
            <Form.Control
              className="form-input"
              name="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={f.phone}
              onChange={form.handleChange}
              isInvalid={!!form.errors.phone}
            />
            <Form.Control.Feedback type="invalid">
              {form.errors.phone}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Senha *</Form.Label>
            <div className="input-eye-wrapper">
              <Form.Control
                className="form-input"
                type={pwdType}
                name="password"
                placeholder="Mín. 8 caracteres, maiúscula e número"
                value={f.password}
                onChange={form.handleChange}
                isInvalid={!!form.errors.password}
              />
              <button type="button" className="eye-btn" onClick={togglePwd}>
                {showPwd ? "🙈" : "👁️"}
              </button>
              <Form.Control.Feedback type="invalid">
                {form.errors.password}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Confirmar Senha *</Form.Label>
            <div className="input-eye-wrapper">
              <Form.Control
                className="form-input"
                type={confirmType}
                name="confirmPassword"
                placeholder="Repita a senha"
                value={f.confirmPassword}
                onChange={form.handleChange}
                isInvalid={!!form.errors.confirmPassword}
              />
              <button type="button" className="eye-btn" onClick={toggleConfirm}>
                {showConfirm ? "🙈" : "👁️"}
              </button>
              <Form.Control.Feedback type="invalid">
                {form.errors.confirmPassword}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              label="Li e aceito os termos de uso"
              checked={f.acceptTerms}
              onChange={form.handleChange}
              isInvalid={!!form.errors.acceptTerms}
              feedback={form.errors.acceptTerms}
              feedbackType="invalid"
            />
          </Form.Group>

          <FeedbackMessage message={form.apiError} type="error" />

          <button
            className="form-page-button"
            type="submit"
            disabled={form.loading}
          >
            {form.loading ? "Criando conta..." : "Cadastrar"}
          </button>
        </Form>

        <p className="form-page-footer">
          Já tem conta?{" "}
          <Link className="form-page-link" to="/login">
            Entrar
          </Link>
        </p>
      </div>
    </Container>
  );
}

export default Register;
