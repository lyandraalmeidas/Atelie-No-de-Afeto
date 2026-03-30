import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Container } from 'react-bootstrap';
import './FormPage.css';

function Cadastro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState('');

  const validate = () => {
    const err = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const cpfRegex = /^\d{11}$/;

    if (!formData.name.trim()) err.name = 'Informe seu nome';

    if (!cpfRegex.test(formData.cpf))
      err.cpf = 'CPF deve conter 11 números';

    if (!emailRegex.test(formData.email))
      err.email = 'E-mail inválido';

    if (!formData.phone.trim())
      err.phone = 'Informe seu telefone';

    if (formData.password.length < 8)
      err.password = 'Senha deve ter no mínimo 8 caracteres';

    if (formData.password !== formData.confirmPassword)
      err.confirmPassword = 'As senhas não conferem';

    if (!formData.acceptTerms)
      err.acceptTerms = 'Você precisa aceitar os termos de uso';

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
    setFeedback('Cadastro realizado com sucesso!');

    // 🔥 Aqui depois você conecta com API
    setTimeout(() => navigate('/login'), 1000);
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
          <h1 className="form-page-title">Criar Conta</h1>
          <p className="form-page-subtitle">Seu espaço de carinho começa aqui.</p>
          <div className="form-page-keynotes">
            <span>Entrega rápida</span>
            <span>Cadastro seguro</span>
            <span>Ofertas exclusivas</span>
          </div>
        </div>

        <Form className="form-page-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <Form.Group className="mb-4 form-col">
              <Form.Label>Nome</Form.Label>
              <Form.Control className="form-input" placeholder="Nome completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4 form-col">
              <Form.Label>CPF</Form.Label>
              <Form.Control
                className="form-input"
                name="cpf"
                placeholder="CPF sem pontos"
                value={formData.cpf}
                onChange={handleChange}
                isInvalid={!!errors.cpf}
              />
              <Form.Control.Feedback type="invalid">
                {errors.cpf}
              </Form.Control.Feedback>
            </Form.Group>
          </div>

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
            <Form.Label>Telefone</Form.Label>
            <Form.Control
              className="form-input"
              name="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={handleChange}
              isInvalid={!!errors.phone}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Senha</Form.Label>
            <Form.Control
              className="form-input"
              type="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Confirmar Senha</Form.Label>
            <Form.Control
              className="form-input"
              type="password"
              name="confirmPassword"
              placeholder="Repita a senha"
              value={formData.confirmPassword}
              onChange={handleChange}
              isInvalid={!!errors.confirmPassword}
            />
            <Form.Control.Feedback type="invalid">
              {errors.confirmPassword}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4 form-checkbox">
            <Form.Check
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              label="Li e aceito os termos de uso"
              checked={formData.acceptTerms}
              onChange={handleChange}
              isInvalid={!!errors.acceptTerms}
              feedback={errors.acceptTerms}
              feedbackType="invalid"
            />
          </Form.Group>

          <Button className="form-page-button" type="submit">
            Cadastrar
          </Button>

          {feedback && <div className="form-page-feedback form-page-feedback--success">{feedback}</div>}

          {feedback && <p className="form-page-footer">{feedback}</p>}
        </Form>

        <p className="form-page-footer">
          Já tem conta? <Link className="form-page-link" to="/login">Entrar</Link>
        </p>
      </div>
    </Container>
  );
}

export default Cadastro;