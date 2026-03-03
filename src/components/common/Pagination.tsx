interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="pagination" aria-label="Paginacion de empresas">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1}>
        Anterior
      </button>
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          className={item === page ? 'active' : ''}
          onClick={() => onChange(item)}
          aria-current={item === page ? 'page' : undefined}
        >
          {item}
        </button>
      ))}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === totalPages}>
        Siguiente
      </button>
    </nav>
  );
}
