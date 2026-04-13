import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Página não encontrada</h1>
        <p className="not-found-subtitle">
          O laço que você procura parece ter se perdido no caminho.
        </p>
        <Link to="/" className="not-found-btn">Voltar para o início</Link>
      </div>
    </div>
  );
}

export default NotFound;