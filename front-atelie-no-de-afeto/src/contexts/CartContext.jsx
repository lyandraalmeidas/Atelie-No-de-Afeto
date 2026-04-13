import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const API = process.env.REACT_APP_API_URL || "http://localhost:3333/api";

const normalizeItems = (apiItems = []) =>
  apiItems.map(({ product, quantity }) => ({ ...product, quantity }));

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

async function loadCartFromApi() {
  const res = await fetch(`${API}/carrinho`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Erro ao carregar carrinho.");
  const data = await res.json();
  return normalizeItems(data.items ?? []);
}

async function cartApiCall(method, path, body = null) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: getAuthHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Erro no carrinho.");
  }
  if (res.status === 204) return [];
  return loadCartFromApi();
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    loadCartFromApi()
      .then(setItems)
      .catch(() => setItems([]));
  }, [user]);

  const addItem = useCallback(
    async (product) => {
      const existing = itemsRef.current.find((i) => i.id === product.id);
      const currentQty = existing?.quantity ?? 0;
      if (currentQty >= (product.stock ?? 0)) return;

      if (user) {
        try {
          const updated = await cartApiCall("POST", "/carrinho/itens", {
            productId: product.id,
            quantity: 1,
          });
          setItems(updated);
        } catch {}
        return;
      }

      setItems((prev) => {
        const found = prev.find((i) => i.id === product.id);
        return found
          ? prev.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
            )
          : [...prev, { ...product, quantity: 1 }];
      });
    },
    [user],
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      const item = itemsRef.current.find((i) => i.id === productId);
      if (!item) return;

      const safeQty = Math.min(Math.max(0, quantity), item.stock ?? Infinity);

      if (user) {
        try {
          const updated =
            safeQty === 0
              ? await cartApiCall("DELETE", `/carrinho/itens/${productId}`)
              : await cartApiCall("PUT", `/carrinho/itens/${productId}`, {
                  quantity: safeQty,
                });
          setItems(updated);
        } catch {}
        return;
      }

      setItems((prev) =>
        safeQty <= 0
          ? prev.filter((i) => i.id !== productId)
          : prev.map((i) =>
              i.id === productId ? { ...i, quantity: safeQty } : i,
            ),
      );
    },
    [user],
  );

  const removeItem = useCallback(
    async (productId) => {
      if (user) {
        try {
          const updated = await cartApiCall(
            "DELETE",
            `/carrinho/itens/${productId}`,
          );
          setItems(updated);
        } catch {}
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== productId));
    },
    [user],
  );

  const clearCart = useCallback(async () => {
    if (user) {
      try {
        await cartApiCall("DELETE", "/carrinho");
      } catch {}
    }
    setItems([]);
  }, [user]);

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
};
