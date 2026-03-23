import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import './Login.css';

function Login() {
  return (
    <Container className="login-container">
      <div className="login-wrapper">
        <h1 className="login-title">Entrar na Sua Conta</h1>
        <p className="login-subtitle">Bem-vindo ao Ateliê Nós de Afeto!</p>
        
        <Form className="login-form">
          <Form.Group className="mb-4">
            <Form.Label className="form-label">Email</Form.Label>
            <Form.Control 
              type="email" 
              placeholder="seu@email.com"
              className="form-input"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="form-label">Senha</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Digite sua senha"
              className="form-input"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Check 
              type="checkbox" 
              label="Lembrar minha senha"
              className="form-check"
            />
          </Form.Group>

          <Button className="login-button" type="submit">
            Entrar
          </Button>
        </Form>

        <p className="login-footer">
          Não tem conta? <a href="/cadastro" className="link-criar">Criar uma agora</a>
        </p>
      </div>
    </Container>
  );
}

export default Login;