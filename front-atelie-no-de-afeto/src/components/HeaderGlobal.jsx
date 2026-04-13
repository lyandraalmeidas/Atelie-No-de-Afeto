import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaSignInAlt, FaSignOutAlt, FaUserCog, FaUserCircle, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './HeaderGlobal.css';

function HeaderGlobal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Navbar expand="lg" fixed="top" className="bg-body-tertiary Menu">
      <Container>
        <Navbar.Brand as={Link} to="/">Ateliê Nós de Afeto</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/produtos">Produtos</Nav.Link>

            <Nav.Link as={Link} to="/carrinho" className="nav-cart">
              <FaShoppingCart className="nav-icon" />
              Carrinho
            </Nav.Link>

            {user ? (
              <>
                <Nav.Link as={Link} to="/perfil" className="nav-user-name">
                  <FaUserCircle className="nav-icon" />
                  {user.name.split(' ')[0]}
                </Nav.Link>
                {/* esse botão só fica visível pra admin */}
                {isAdmin && (
                  <Nav.Link as={Link} to="/admin" className="nav-admin">
                    <FaUserCog className="nav-icon" /> Admin
                  </Nav.Link>
                )}
                <Nav.Link as="button" className="nav-cta" onClick={handleLogout}>
                  <FaSignOutAlt className="nav-icon" /> Sair
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/cadastro" className="nav-cta">
                  <FaUserPlus className="nav-icon" /> Cadastro
                </Nav.Link>
                <Nav.Link as={Link} to="/login" className="nav-cta">
                  <FaSignInAlt className="nav-icon" /> Login
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default HeaderGlobal;