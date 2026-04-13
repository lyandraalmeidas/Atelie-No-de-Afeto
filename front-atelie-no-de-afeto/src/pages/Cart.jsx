import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import FeedbackMessage from "../components/FeedbackMessage";
import "./Cart.css";

const formatPrice = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

function CartItem({ item, onRemove, onChangeQty }) {
  const atMax = item.quantity >= (item.stock ?? Infinity);
  const atMin = item.quantity <= 1;

  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <strong>{item.name}</strong>
        <span className="cart-item-price">{formatPrice(item.price)} cada</span>
        <span className="cart-item-stock">
          Estoque disponível: {item.stock}
        </span>
      </div>
      <div className="cart-item-controls">
        <button
          className="cart-qty-btn"
          disabled={atMin}
          onClick={() => onChangeQty(item.id, item.quantity - 1)}
        >
          -
        </button>
        <span className="cart-qty">{item.quantity}</span>
        <button
          className="cart-qty-btn"
          disabled={atMax}
          onClick={() => onChangeQty(item.id, item.quantity + 1)}
          title={atMax ? "Limite de estoque atingido" : ""}
        >
          +
        </button>
        <span className="cart-item-subtotal">
          {formatPrice(Number(item.price) * item.quantity)}
        </span>
        <button className="cart-remove-btn" onClick={() => onRemove(item.id)}>
          ✕
        </button>
      </div>
    </div>
  );
}

function Cart() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3333/api"}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            items: items.map((i) => ({
              productId: i.id,
              quantity: i.quantity,
            })),
          }),
        },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message);
      }
      await clearCart();
      navigate("/produtos");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="cart-page">
        <div className="cart-header">
          <h1>Meu Carrinho</h1>
          <p>Revise os itens antes de finalizar sua compra.</p>
        </div>
        <div className="cart-empty">
          <p>Seu carrinho está vazio.</p>
          <Link to="/produtos" className="home-hero-button">
            Ver produtos
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="cart-header">
        <h1>Meu Carrinho</h1>
        <p>Revise os itens antes de finalizar.</p>
      </div>
      <div className="cart-content">
        <div className="cart-items">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={removeItem}
              onChangeQty={updateQuantity}
            />
          ))}
        </div>
        <div className="cart-summary">
          <div className="cart-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <FeedbackMessage message={error} type="error" />
          <button
            className="cart-checkout-btn"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading
              ? "Finalizando..."
              : user
                ? "Finalizar Pedido"
                : "Entrar para Finalizar"}
          </button>
          <Link to="/produtos" className="cart-continue">
            ← Continuar comprando
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Cart;
