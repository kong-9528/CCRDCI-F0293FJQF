type Props = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  pageSizes?: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function SsoPagination({
  page,
  pageSize,
  total,
  totalPages,
  pageSizes = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
}: Props) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="sso-pagination">
      <div className="sso-pagination__info">
        共 <b>{total}</b> 条，当前 {from}-{to}
      </div>
      <div className="sso-pagination__controls">
        <label className="sso-pagination__size">
          每页
          <select
            className="sso-select sso-select--sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizes.map((n) => (
              <option key={n} value={n}>
                {n} 条
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="sso-btn sso-btn--ghost sso-btn--sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          上一页
        </button>
        <span className="sso-pagination__page">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="sso-btn sso-btn--ghost sso-btn--sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  );
}
