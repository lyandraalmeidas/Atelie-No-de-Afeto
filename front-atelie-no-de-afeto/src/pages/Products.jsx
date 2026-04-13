import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../hooks/useProducts';
import Pagination from '../components/Pagination';
import './Products.css';

const formatPrice = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function ProductCard({ product, onAdd, addedQty }) {
  const maxReached = addedQty >= (product.stock ?? 0);
  return (
    <article className="product-card">
      {product.imageUrl && (
        <div className="product-card-image">
          <img src={product.imageUrl} alt={product.name} />
        </div>
      )}
      <div className="product-card-body">
        <span className="product-category">{product.category?.name}</span>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <span className="product-stock">Estoque: {product.stock}</span>
      </div>
      <div className="product-card-footer">
        <span className="product-price">{formatPrice(product.price)}</span>
        <button
          className={`home-hero-button product-add-btn${addedQty ? ' product-add-btn--added' : ''}`}
          onClick={() => onAdd(product)}
          disabled={maxReached}
        >
          {maxReached ? '✓ Limite' : addedQty ? '✓ Adicionado' : 'Adicionar'}
        </button>
      </div>
    </article>
  );
}

function Products() {
  const { addItem, itemCount } = useCart();
  const navigate = useNavigate();
  const { products, meta, setPage, loading, error } = useProducts(1, 9);
  const [addedMap, setAddedMap] = useState({}); // { productId: qty } para feedback visual
  const [cartPulse, setCartPulse] = useState(false);

  const handleAdd = (product) => {
    const current = addedMap[product.id] ?? 0;
    if (current >= product.stock) return;
    addItem(product);
    setAddedMap((prev) => ({ ...prev, [product.id]: current + 1 }));
    setCartPulse(true);
    setTimeout(() => setAddedMap((prev) => ({ ...prev, [product.id]: 0 })), 1500);
    setTimeout(() => setCartPulse(false), 600);
  };

  return (
    <section className="products-page">
      <div className="products-header">
        <h1>Produtos</h1>
        <p>Explore nossas criações feitas à mão com muito afeto.</p>
        {itemCount > 0 && (
          <button
            className={`cart-badge-btn${cartPulse ? ' cart-badge-btn--pulse' : ''}`}
            onClick={() => navigate('/carrinho')}
          >
            🛒 Ver carrinho ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
          </button>
        )}
      </div>

      {loading && <p className="products-status">Carregando produtos...</p>}
      {error && <p className="products-status products-status--error">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="products-status">Nenhum produto disponível no momento.</p>
      )}

      <div className="products-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={handleAdd} addedQty={addedMap[p.id] ?? 0} />
        ))}
      </div>

      <Pagination meta={meta} onPageChange={setPage} />
    </section>
  );
}

export default Products;