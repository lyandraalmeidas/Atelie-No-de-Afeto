import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!formData.email.trim()) validationErrors.email = 'Informe seu e-mail.';
    else if (!emailRegex.test(formData.email)) validationErrors.email = 'E-mail inválido.';

    if (!formData.password) validationErrors.password = 'Informe sua senha.';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFeedback('');
      return;
    }

    setErrors({});
    setFeedback('Login efetuado com sucesso! Redirecionando...');

    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <Container className="login-container">
      <div className="login-wrapper">
        <h1 className="login-title">Entrar na Sua Conta</h1>
        <p className="login-subtitle">Bem-vindo ao Ateliê Nós de Afeto!</p>

        <Form className="login-form" onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-4" controlId="loginEmail">
            <Form.Label className="form-label">Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              placeholder="seu@email.com"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              required
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="loginPassword">
            <Form.Label className="form-label">Senha</Form.Label>
            <Form.Control
              name="password"
              type="password"
              placeholder="Digite sua senha"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
              required
            />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="loginRemember">
            <Form.Check
              name="remember"
              type="checkbox"
              label="Lembrar minha senha"
              className="form-check"
              checked={formData.remember}
              onChange={handleChange}
            />
          </Form.Group>

          <Button className="login-button" type="submit">
            Entrar
          </Button>

          {feedback && <p className="login-footer" style={{ marginTop: '12px', color: '#2d6a4f' }}>{feedback}</p>}
        </Form>

        <p className="login-footer">
          Não tem conta? <Link to="/cadastro" className="link-criar">Criar uma agora</Link>
        </p>
      </div>
    </Container>
  );
}

export default Login;