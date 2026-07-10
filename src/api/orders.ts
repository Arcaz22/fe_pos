import { apiClient } from "@/lib/api-client";
import type {
  CreateOrderPayload,
  Order,
  OrderListParams,
  OrderStatus,
  PaymentStatus,
  UpdateOrderPayload,
} from "@/types/order";

export const ordersApi = {
  list: (params?: OrderListParams) => apiClient.get<Order[]>("/orders", { params }).then((r) => r.data),

  detail: (id: number) => apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),

  create: (payload: CreateOrderPayload) =>
    apiClient.post<Order>("/orders", payload).then((r) => r.data),

  update: (id: number, payload: UpdateOrderPayload) =>
    apiClient.patch<Order>(`/orders/${id}`, payload).then((r) => r.data),

  updateStatus: (id: number, status: OrderStatus) =>
    apiClient.patch<Order>(`/orders/${id}/status`, { status }).then((r) => r.data),

  updatePaymentStatus: (id: number, payment_status: PaymentStatus) =>
    apiClient.patch<Order>(`/orders/${id}/payment-status`, { payment_status }).then((r) => r.data),

  cancel: (id: number) => apiClient.post<Order>(`/orders/${id}/cancel`).then((r) => r.data),
};
