export type OrderStatus = "pending" | "in_progress" | "ready" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "refunded";
export type PaymentMethod = "cash" | "gateway";
export type OrderType = "dine_in" | "takeaway";

export interface OrderItem {
  id: number;
  product_id: number;
  product_name_snapshot: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  notes: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  queue_number: string;
  cashier_user_id: number;
  customer_name: string | null;
  order_type: OrderType;
  table_number: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: string;
  total_amount: string;
  cash_received: string | null;
  change_amount: string | null;
  cash_session_id: number | null;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderListParams {
  offset?: number;
  limit?: number;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  order_number?: string;
  queue_number?: string;
  created_from?: string;
  created_to?: string;
}

export interface OrderItemPayload {
  product_id: number;
  quantity: number;
  notes?: string | null;
}

export interface CreateOrderPayload {
  customer_name?: string | null;
  order_type: OrderType;
  table_number?: string | null;
  payment_method: PaymentMethod;
  notes?: string | null;
  items: OrderItemPayload[];
}

// OrderUpdateRequest di backend = OrderCreateRequest (inherit semua field, termasuk
// payment_method sebagai required) — jadi shape-nya identik, bukan Partial.
export type UpdateOrderPayload = CreateOrderPayload;

// Transisi status valid — dipakai lib/status-transitions.ts di Tahap 3
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["in_progress", "cancelled"],
  in_progress: ["ready", "cancelled"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};
