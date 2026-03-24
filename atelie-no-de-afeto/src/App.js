import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Home from './pages/BemVindos';
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

export default App;
