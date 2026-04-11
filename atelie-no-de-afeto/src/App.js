import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Login from './pages/Login';
import Produtos from './pages/Produtos';
import Carrinho from './pages/Carrinho';
import Cadastro from './pages/Cadastro';
import AdminPage from'./pages/AdminPage';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Menu fixo no topo, presente em todas as páginas */}
        <Menu />
        <main>
          {/* Rotas principais do site: Home, admin, produtos, carrinho, cadastro e login */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>

        {/* Footer global com informações de contato e links úteis */}
        <footer className="site-footer">
          <div className="footer-grid">
            <div>
              <h3>Ateliê Nós de Afeto</h3>
              <p>Peças artesanais criadas com carinho para celebrar afetos, memórias e momentos especiais.</p>
            </div>
            <div>
              <h4>Contato</h4>
              <p>contato@nosdeafeto.com</p>
              <p>+55 44 98765-4321</p>
            </div>
            <div>
              <h4>Endereço</h4>
              <p>Rua Aparecida Fit</p>
              <p>Bairro Águas de Jurema, Iretama - PR</p>
            </div>
            <div>
              <h4>Links úteis</h4>
              <p><a href="/produtos">Produtos</a></p>
              <p><a href="/cadastro">Cadastro</a></p>
            </div>
          </div>
          <div className="footer-copy">
            © {new Date().getFullYear()} Ateliê Nós de Afeto. Todos os direitos reservados.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
