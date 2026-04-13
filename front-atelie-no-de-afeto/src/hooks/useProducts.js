import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';

/**
 * busca produtos e filtra itens sem estoque
 * @param {number} initialPage 
 * @param {number} limit 
 */
export function useProducts(initialPage = 1, limit = 9) {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getProducts(page, limit)
      .then((res) => {
        setProducts(res.data.filter((p) => p.stock > 0));
        setMeta(res.meta);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, limit]);

  return { products, meta, page, setPage, loading, error };
}