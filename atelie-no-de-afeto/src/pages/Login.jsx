import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Container } from 'react-bootstrap';
import './FormPage.css';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState('');

  const validate = () => {
    const err = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(formData.email))
      err.email = 'E-mail inválido';

    if (!formData.password)
      err.password = 'Informe sua senha';

    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback('');

    const err = validate();

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setErrors({});
    setFeedback('Login realizado!');

    // 🔥 depois conecta com API
    setTimeout(() => navigate('/'), 1000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Container className="form-page-container">
      <div className="form-page-wrapper">
        <div className="form-page-top">
          <h1 className="form-page-title">Login</h1>
          <p className="form-page-subtitle">Acesse sua conta e continue a criar com afeto.</p>
        </div>

        <Form className="form-page-form" onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-4">
            <Form.Label>Email</Form.Label>
            <Form.Control
              className="form-input"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Senha</Form.Label>
            <Form.Control
              className="form-input"
              type="password"
              name="password"
              placeholder="Digite sua senha"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3 form-checkbox">
            <Form.Check
              type="checkbox"
              id="remember"
              name="remember"
              label="Lembrar-me"
              checked={formData.remember}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="form-page-actions">
            <a href="#" className="form-page-link form-page-link-secondary" onClick={(e) => e.preventDefault()}>
              Esqueceu sua senha?
            </a>
          </div>

          <Button className="form-page-button" type="submit">
            Entrar
          </Button>

          {feedback && <div className="form-page-feedback form-page-feedback--success">{feedback}</div>}

          {feedback && <p className="form-page-footer">{feedback}</p>}
        </Form>

        <p className="form-page-footer">
          Não tem conta? <Link className="form-page-link" to="/cadastro">Cadastrar</Link>
        </p>
      </div>
    </Container>
  );
}

export default Login;