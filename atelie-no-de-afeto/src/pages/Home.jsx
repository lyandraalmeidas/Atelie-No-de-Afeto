import { Link } from 'react-router-dom';
import './Home.css';

function BemVindos() {
    return (
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-hero-eyebrow">Ateliê Nós de Afeto</span>
          <h1>Seja Bem-vindo ao Nosso Cantinho</h1>
          <p className="home-hero-copy">
            Um espaço amoroso construído de mãe para filha, onde cada peça é feita com cuidado e carinho.
          </p>
          <Link className="home-hero-button" to="/produtos">
            Explorar produtos
          </Link>
        </div>
      </section>
    );
}

export default BemVindos;