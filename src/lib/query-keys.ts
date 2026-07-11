import type { OrderListParams } from "@/types/order";
import type { ProductListParams } from "@/types/product";

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
};
