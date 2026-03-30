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
        <Menu />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
