import { apiClient } from "@/lib/api-client";
import type { Product, ProductListParams, ProductPayload } from "@/types/product";

export const productsApi = {
  list: (params?: ProductListParams) =>
    apiClient.get<Product[]>("/products", { params }).then((r) => r.data),

  detail: (id: number) => apiClient.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (payload: ProductPayload) =>
    apiClient.post<Product>("/products", payload).then((r) => r.data),

  update: (id: number, payload: ProductPayload) =>
    apiClient.put<Product>(`/products/${id}`, payload).then((r) => r.data),

  remove: (id: number) => apiClient.delete<void>(`/products/${id}`).then((r) => r.data),
};
