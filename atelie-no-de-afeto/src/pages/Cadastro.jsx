import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import './Cadastro.css';

function Cadastro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    email: '',
    countryCode: '+55',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState('');

  const validator = () => {
    const validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!formData.name.trim()) validationErrors.name = 'Informe seu nome.';
    if (!formData.birthDate) validationErrors.birthDate = 'Informe sua data de nascimento.';
    if (!formData.email) validationErrors.email = 'Informe seu e-mail.';
    else if (!emailRegex.test(formData.email)) validationErrors.email = 'E-mail inválido.';
    if (!formData.phone.trim()) validationErrors.phone = 'Informe seu telefone.';

    if (!formData.password) validationErrors.password = 'Informe sua senha.';
    else if (formData.password.length < 8) validationErrors.password = 'Senha deve ter 8+ caracteres.';

    if (formData.password !== formData.confirmPassword) validationErrors.confirmPassword = 'As senhas não conferem.';
    if (!formData.terms) validationErrors.terms = 'Você precisa aceitar os termos.';

    return validationErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFeedback('');
    const validationErrors = validator();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setFeedback('Cadastro realizado com sucesso! Redirecionando...');

    setTimeout(() => {
      navigate('/login');
    }, 1200);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <Container className="cadastro-container">
      <div className="cadastro-wrapper">
        <h1 className="cadastro-title">Crie Sua Conta</h1>
        <p className="cadastro-subtitle">Venha conhecer o nosso trabalho!</p>

        <Form className="cadastro-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <Form.Group className="mb-4 form-col" controlId="cadastroName">
              <Form.Label className="form-label">Nome</Form.Label>
              <Form.Control
                name="name"
                type="text"
                placeholder="Seu nome"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                required
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4 form-col" controlId="cadastroBirthDate">
              <Form.Label className="form-label">Data de Nascimento</Form.Label>
              <Form.Control
                name="birthDate"
                type="date"
                className="form-input"
                value={formData.birthDate}
                onChange={handleChange}
                isInvalid={!!errors.birthDate}
                required
              />
              <Form.Control.Feedback type="invalid">{errors.birthDate}</Form.Control.Feedback>
            </Form.Group>
          </div>

          <Form.Group className="mb-4" controlId="cadastroEmail">
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

          <Form.Group className="mb-4" controlId="cadastroTelefone">
            <Form.Label className="form-label">Telefone</Form.Label>
            <div className="tel-row">
              <Form.Control
                name="countryCode"
                type="tel"
                placeholder="+55"
                className="form-input phone-country"
                value={formData.countryCode}
                onChange={handleChange}
                required
              />
              <Form.Control
                name="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                className="form-input phone-number"
                value={formData.phone}
                onChange={handleChange}
                isInvalid={!!errors.phone}
                required
              />
            </div>
            <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="cadastroPassword">
            <Form.Label className="form-label">Senha</Form.Label>
            <Form.Control
              name="password"
              type="password"
              placeholder="Crie uma senha segura"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
              required
            />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="cadastroConfirmPassword">
            <Form.Label className="form-label">Confirme a Senha</Form.Label>
            <Form.Control
              name="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              isInvalid={!!errors.confirmPassword}
              required
            />
            <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="cadastroTerms">
            <Form.Check
              name="terms"
              type="checkbox"
              label="Concordo com os termos e condições"
              className="form-check"
              checked={formData.terms}
              onChange={handleChange}
              isInvalid={!!errors.terms}
              feedback={errors.terms}
              feedbackType="invalid"
              required
            />
          </Form.Group>

          <Button className="cadastro-button" type="submit">
            Criar Conta
          </Button>

          {feedback && <p className="cadastro-footer" style={{ marginTop: '12px', color: '#2d6a4f' }}>{feedback}</p>}
        </Form>

        <p className="cadastro-footer">
          Já tem conta? <Link to="/login" className="link-login">Faça login aqui</Link>
        </p>
      </div>
    </Container>
  );
}

export default Cadastro;
