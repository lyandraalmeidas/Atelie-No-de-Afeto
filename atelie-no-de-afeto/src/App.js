import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Menu />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div style={{ 
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#5d4037', fontFamily: "'Dancing Script', cursive", fontSize: '3rem' }}>
          Bem-vinda ao Ateliê Nós de Afeto
        </h1>
        <p style={{ color: '#8d6e63', fontSize: '1.2rem' }}>
          Um espaço amoroso construido de mãe para filha
        </p>
      </div>
    </div>
  );
}

export default App;
