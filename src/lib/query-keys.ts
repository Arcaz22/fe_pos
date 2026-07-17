import type { OrderListParams } from "@/types/order";
import type { ProductListParams } from "@/types/product";
import type { CashSessionListParams } from "@/types/cash-session";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params?: ProductListParams) => ["products", "list", params ?? {}] as const,
    detail: (id: number) => ["products", "detail", id] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (params?: OrderListParams) => ["orders", "list", params ?? {}] as const,
    detail: (id: number) => ["orders", "detail", id] as const,
  },
  cashSessions: {
    all: ["cash-sessions"] as const,
    current: ["cash-sessions", "current"] as const,
    list: (params?: CashSessionListParams) => ["cash-sessions", "list", params ?? {}] as const,
    detail: (id: number) => ["cash-sessions", "detail", id] as const,
  },
};
