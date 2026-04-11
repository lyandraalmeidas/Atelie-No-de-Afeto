import { Link } from 'react-router-dom';
import './Home.css';

// Lista fixa de produtos mais vendidos exibida na home
const bestSellingProducts = [
  {
    id: 1,
    name: 'Kit Amor',
    description: 'Conjunto especial com laços e acessórios para presentear com carinho.',
    price: 'R$ 149,90',
  },
  {
    id: 2,
    name: 'Laço de Seda',
    description: 'Laço artesanal com acabamento delicado e toque macio.',
    price: 'R$ 39,90',
  },
  {
    id: 3,
    name: 'Brinco Nó do Afeto',
    description: 'Peça única criada para ocasiões especiais e memórias afetivas.',
    price: 'R$ 69,90',
  },
];

function BemVindos() {
    return (
      <>
        {/* Seção hero com chamada para ação e link para produtos mais vendidos */}
        <section className="home-hero">
          <div className="home-hero-content">
            <span className="home-hero-eyebrow">Ateliê Nós de Afeto</span>
            <h1>Seja Bem-vindo ao Nosso Cantinho</h1>
            <p className="home-hero-copy">
              Um espaço amoroso construído de mãe para filha, onde cada peça é feita com cuidado e carinho.
            </p>
            <div className="home-hero-actions">
              <Link className="home-hero-button" to="/produtos">
                Explorar produtos
              </Link>
              <a className="scroll-down-link" href="#best-sellers" aria-label="Ver próximos produtos mais vendidos">
                <span className="scroll-down-arrow">↓</span>
                Ver mais vendidos
              </a>
            </div>
          </div>
        </section>

        <section id="best-sellers" className="best-sellers">
          <div className="best-sellers-header">
            <h2>Mais Vendidos</h2>
            <p>Conheça os produtos que mais encantam nossas clientes e fazem sucesso nas vendas.</p>
          </div>
          <div className="best-sellers-grid">
            {bestSellingProducts.map((product) => (
              <article key={product.id} className="best-seller-card">
                <div className="best-seller-badge">Mais vendido</div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="best-seller-footer">
                  <span className="best-seller-price">{product.price}</span>
                  <Link className="best-seller-button" to="/produtos">
                    Ver produto
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </>
    );
}

export default BemVindos;