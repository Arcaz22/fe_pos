import { useState } from "react";

interface UsePaginationOptions {
  initialLimit?: number;
}

export function usePagination({ initialLimit = 20 }: UsePaginationOptions = {}) {
  const [offset, setOffset] = useState(0);
  const [limit] = useState(initialLimit);

  return {
    offset,
    limit,
    page: Math.floor(offset / limit) + 1,
    nextPage: () => setOffset((prev) => prev + limit),
    prevPage: () => setOffset((prev) => Math.max(0, prev - limit)),
    reset: () => setOffset(0),
    // dipakai DataTable untuk disable tombol "next" saat hasil < limit (halaman terakhir)
    hasNextPage: (resultCount: number) => resultCount === limit,
    hasPrevPage: offset > 0,
  };
}
