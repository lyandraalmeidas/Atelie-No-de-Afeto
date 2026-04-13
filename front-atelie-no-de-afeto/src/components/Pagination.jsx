import './Pagination.css';

function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  const { page, totalPages, total } = meta;
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="pagination-bar">
      <button className="pagination-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        ← Anterior
      </button>

      <div className="pagination-pages">
        {pages.map((p) => (
          <button key={p} className={`pagination-page${p === page ? ' pagination-page--active' : ''}`}
            onClick={() => onPageChange(p)}>{p}</button>
        ))}
      </div>

      <button className="pagination-btn" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        Próxima →
      </button>

      <span className="pagination-info">{total} itens</span>
    </div>
  );
}

export default Pagination;