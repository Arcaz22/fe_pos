import { apiClient } from "@/lib/api-client";
import type {
  CreateOrderPayload,
  Order,
  OrderListParams,
  OrderStatus,
  PaymentStatus,
  UpdateOrderPayload,
} from "@/types/order";
import type { PaginatedResult } from "@/types/common";

export const ordersApi = {
  list: (params?: OrderListParams): Promise<PaginatedResult<Order>> =>
    apiClient.get<Order[]>("/orders", { params }).then((r) => ({
      items: r.data,
      total: (r.meta?.total as number | undefined) ?? r.data.length,
    })),

  detail: (id: number) => apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),

  create: (payload: CreateOrderPayload) =>
    apiClient.post<Order>("/orders", payload).then((r) => r.data),

  update: (id: number, payload: UpdateOrderPayload) =>
    apiClient.patch<Order>(`/orders/${id}`, payload).then((r) => r.data),

  updateStatus: (id: number, status: OrderStatus) =>
    apiClient.patch<Order>(`/orders/${id}/status`, { status }).then((r) => r.data),

  updatePaymentStatus: (id: number, payment_status: PaymentStatus, cash_received?: number) =>
    apiClient
      .patch<Order>(`/orders/${id}/payment-status`, { payment_status, cash_received })
      .then((r) => r.data),

  cancel: (id: number) => apiClient.post<Order>(`/orders/${id}/cancel`).then((r) => r.data),
};
