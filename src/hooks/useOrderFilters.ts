import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { OrderListParams, OrderStatus, PaymentStatus } from "@/types/order";

/**
 * Filter order disimpan di query string (?status=pending&payment_status=paid&...)
 * supaya kalau kasir refresh halaman atau share link, filter yang sedang aktif tetap ada.
 */
export function useOrderFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: OrderListParams = useMemo(
    () => ({
      status: (searchParams.get("status") as OrderStatus) || undefined,
      payment_status: (searchParams.get("payment_status") as PaymentStatus) || undefined,
      order_number: searchParams.get("order_number") || undefined,
      queue_number: searchParams.get("queue_number") || undefined,
      created_from: searchParams.get("created_from") || undefined,
      created_to: searchParams.get("created_to") || undefined,
    }),
    [searchParams]
  );

  const setFilter = useCallback(
    (key: keyof OrderListParams, value: string | undefined) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => setSearchParams({}), [setSearchParams]);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return { filters, setFilter, clearFilters, hasActiveFilters };
}
