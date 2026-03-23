import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';

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
    <div>
    </div>
  );
}

function Cadastro() {
  return <h1>Página de Cadastro</h1>;
}

function Login() {
  return <h1>Página de Login</h1>;
}

export default App;
