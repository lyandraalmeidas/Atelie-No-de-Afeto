import { useState, useEffect, useCallback } from 'react';

/**
 * 
 * @param {Function} fetchFn 
 * @param {Function} deleteFn 
 */
export function useAdminTable(fetchFn, deleteFn) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback((p) => {
    setError('');
    setLoading(true);
    fetchFn(p)
      .then((r) => { setItems(r.data); setMeta(r.meta); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetchFn]);

  useEffect(() => { load(page); }, [page, load]);

  const handleDelete = async (id, successMsg = 'Item removido.') => {
    try {
      await deleteFn(id);
      setFeedback(successMsg);
      load(page);
    } catch (e) {
      setError(e.message);
    }
  };

  return { items, meta, page, setPage, feedback, error, loading, handleDelete, reload: () => load(page) };
}