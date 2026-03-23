import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import './Cadastro.css';

function Cadastro() {
  return (
    <Container className="cadastro-container">
      <div className="cadastro-wrapper">
        <h1 className="cadastro-title">Crie Sua Conta</h1>
        <p className="cadastro-subtitle">Venha conhecer o nosso trabalho!</p>
        
        <Form className="cadastro-form">
          <div className="form-row">
            <Form.Group className="mb-4 form-col">
              <Form.Label className="form-label">Nome</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Seu nome"
                className="form-input"
              />
            </Form.Group>

            <Form.Group className="mb-4 form-col">
              <Form.Label className="form-label">Data de Nascimento</Form.Label>
              <Form.Control 
                type="date"
                className="form-input"
              />
            </Form.Group>
          </div>

          <Form.Group className="mb-4">
            <Form.Label className="form-label">Email</Form.Label>
            <Form.Control 
              type="email" 
              placeholder="seu@email.com"
              className="form-input"
            />
          </Form.Group>

          <div className="form-row">
            <Form.Group className="mb-4 form-col">
              <Form.Label className="form-label">Telefone</Form.Label>
              <Form.Control 
                type="tel" 
                placeholder="(11) 99999-9999"
                className="form-input"
              />
            </Form.Group>

            <Form.Group className="mb-4 form-col">
              <Form.Label className="form-label">CEP</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Seu CEP"
                className="form-input"
              />
            </Form.Group>
          </div>

          <Form.Group className="mb-4">
            <Form.Label className="form-label">Senha</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Crie uma senha segura"
              className="form-input"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="form-label">Confirme a Senha</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Confirme sua senha"
              className="form-input"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Check 
              type="checkbox" 
              label="Concordo com os termos e condições"
              className="form-check"
            />
          </Form.Group>

          <Button className="cadastro-button" type="submit">
            Criar Conta
          </Button>
        </Form>

        <p className="cadastro-footer">
          Já tem conta? <a href="/login" className="link-login">Faça login aqui</a>
        </p>
      </div>
    </Container>
  );
}

export default Cadastro;
