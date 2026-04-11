import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import './Menu.css';

function Menu() {
  return (
    // Menu fixo com navegação principal e botões de ação rápida
    <Navbar expand="lg" fixed="top" className="bg-body-tertiary Menu">
      <Container>
        <Navbar.Brand as={Link} to="/">Ateliê Nós de Afeto</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/produtos">Produtos</Nav.Link>
            <Nav.Link as={Link} to="/carrinho">Carrinho</Nav.Link>
            {/* Botão destacado para acesso rápido ao painel administrativo */}
            <Nav.Link as={Link} to="/admin" className="nav-admin">Admin</Nav.Link>
            <Nav.Link as={Link} to="/cadastro" className="nav-cta">
              <FaUserPlus className="nav-icon" /> Cadastro
            </Nav.Link>
            <Nav.Link as={Link} to="/login" className="nav-cta">
              <FaSignInAlt className="nav-icon" /> Login
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Menu;