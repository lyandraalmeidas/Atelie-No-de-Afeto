import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "./Home.css";

// formata o valor automaticamente
const formatPrice = (price) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    price,
  );

function AdminBanner() {
  return (
    <div className="home-admin-banner">
      <div className="home-admin-banner-content">
        <span>
          👋 Você está logado como <strong>Administrador</strong>
        </span>
        <Link to="/admin" className="home-admin-banner-btn">
          Acessar Painel Admin →
        </Link>
      </div>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // pega os 3 últimos produtos cadastrados como best sellers
    getProducts(1, 3)
      .then((res) => setBestSellers(res.data.filter((p) => p.stock > 0)))
      .catch(() => setBestSellers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {user?.role === "ADMIN" && <AdminBanner />}
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-hero-eyebrow">Ateliê Nós de Afeto</span>
          <h1>Seja Bem-vindo ao Nosso Cantinho</h1>
          <p className="home-hero-copy">
            Um espaço amoroso construído de mãe para filha, onde cada peça é
            feita com cuidado e carinho.
          </p>
          <div className="home-hero-actions">
            <Link className="home-hero-button" to="/produtos">
              Explorar produtos
            </Link>
            <a
              className="scroll-down-link"
              href="#best-sellers"
              aria-label="Ver produtos mais vendidos"
            >
              <span className="scroll-down-arrow">↓</span>
              Ver mais vendidos
            </a>
          </div>
        </div>
      </section>

      <section id="best-sellers" className="best-sellers">
        <div className="best-sellers-header">
          <h2>Mais Vendidos</h2>
          <p>
            Conheça os produtos que mais encantam nossas clientes e fazem
            sucesso nas vendas.
          </p>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
            Carregando produtos...
          </p>
        ) : (
          <div className="best-sellers-grid">
            {bestSellers.map((product) => (
              <article key={product.id} className="best-seller-card">
                <div className="best-seller-badge">Destaque</div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="best-seller-footer">
                  <span className="best-seller-price">
                    {formatPrice(product.price)}
                  </span>
                  <Link className="best-seller-button" to="/produtos">
                    Ver produto
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Home;
