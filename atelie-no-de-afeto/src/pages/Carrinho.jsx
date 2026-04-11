import { Link } from 'react-router-dom';
import './Carrinho.css';

// Página do carrinho. Exibe o estado atual do carrinho e guia para finalizar a compra.
function Carrinho() {
    return (
        <section className="carrinho-page">
            <div className="carrinho-header">
                <h1>Meu Carrinho</h1>
                <p>Revise os itens selecionados antes de finalizar sua compra.</p>
            </div>
            <div className="carrinho-content">
                <div className="carrinho-empty">
                    <p>Seu carrinho ainda está vazio.</p>
                    <Link to="/produtos" className="home-hero-button">Voltar aos produtos</Link>
                </div>
            </div>
        </section>
    );
}

export default Carrinho;
