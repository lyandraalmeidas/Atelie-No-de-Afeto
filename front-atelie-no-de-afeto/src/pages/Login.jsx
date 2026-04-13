import { Link, useNavigate } from "react-router-dom";
import { Form, Container } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { isValidEmail } from "../utils/validators";
import { useForm } from "../hooks/useForm";
import { usePasswordToggle } from "../hooks/usePasswordToggle";
import FeedbackMessage from "../components/FeedbackMessage";
import "./Profile.css";

const INITIAL = { email: "", password: "" };

function validate(values) {
  const e = {};
  if (!isValidEmail(values.email)) e.email = "E-mail inválido.";
  if (!values.password) e.password = "Informe sua senha.";
  return e;
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const form = useForm(INITIAL, validate);
  const [showPwd, togglePwd, pwdType] = usePasswordToggle();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await form.submit(async (values) => {
      const data = await login(values.email, values.password);
      const destination = data.user.role === "ADMIN" ? "/admin" : "/";
      navigate(destination);
    });
    // navigate já acontece dentro do submit acima se ok
    void ok;
  };

  const f = form.values;

  return (
    <Container className="form-page-container">
      <div className="form-page-wrapper">
        <div className="form-page-top">
          <h1 className="form-page-title">Login</h1>
          <p className="form-page-subtitle">
            Acesse sua conta e continue com afeto.
          </p>
        </div>

        <Form className="form-page-form" onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-4">
            <Form.Label>E-mail</Form.Label>
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
            <Form.Label>Senha</Form.Label>
            <div className="input-eye-wrapper">
              <Form.Control
                className="form-input"
                type={pwdType}
                name="password"
                placeholder="Digite sua senha"
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

          <FeedbackMessage message={form.apiError} type="error" />

          <button
            className="form-page-button"
            type="submit"
            disabled={form.loading}
          >
            {form.loading ? "Entrando..." : "Entrar"}
          </button>
        </Form>

        <p className="form-page-footer">
          Não tem conta?{" "}
          <Link className="form-page-link" to="/cadastro">
            Cadastrar
          </Link>
        </p>
      </div>
    </Container>
  );
}

export default Login;
