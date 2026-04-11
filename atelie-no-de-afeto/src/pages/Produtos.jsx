import { Link } from 'react-router-dom';
import './Home.css';

// Página de produtos. Atualize com dados reais ou integração de catálogo quando disponível.
function Produtos() {
    return (
        <section className="products-page">
            <div className="products-header">
                <h1>Produtos</h1>
                <p>Explore nossas criações feitas à mão e encontre o presente perfeito cheio de afeto.</p>
            </div>
            <div className="products-list">
                <article className="product-card">
                    <h2>Kit Amor</h2>
                    <p>Conjunto especial com peças artesanais e detalhes delicados.</p>
                    <Link to="/cadastro" className="home-hero-button">Quero saber mais</Link>
                </article>
                <article className="product-card">
                    <h2>Laços e Acessórios</h2>
                    <p>Peças femininas e personalizadas para todas as ocasiões.</p>
                    <Link to="/carrinho" className="home-hero-button">Ver carrinho</Link>
                </article>
            </div>
        </section>
    );
}

export default Produtos;
