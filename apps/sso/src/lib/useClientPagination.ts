import { useEffect, useMemo, useState } from "react";

const DEFAULT_SIZES = [10, 20, 50] as const;

export function useClientPagination<T>(items: T[], defaultSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  const setSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return {
    page: safePage,
    pageSize,
    total,
    totalPages,
    pageItems,
    setPage,
    setPageSize: setSize,
    pageSizes: DEFAULT_SIZES,
    resetPage: () => setPage(1),
  };
}
