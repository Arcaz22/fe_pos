import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/lib/toast";
import type {
  CreateOrderPayload,
  OrderListParams,
  OrderStatus,
  PaymentStatus,
  UpdateOrderPayload,
} from "@/types/order";

export function useOrders(params?: OrderListParams) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => ordersApi.list(params),
    placeholderData: (prev) => prev,
    refetchInterval: 30_000, // kasir butuh lihat order baru masuk tanpa manual refresh
  });
}

export function useOrder(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id!),
    queryFn: () => ordersApi.detail(id!),
    enabled: id !== undefined,
    refetchInterval: 15_000,
  });
}

function invalidateOrderQueries(queryClient: ReturnType<typeof useQueryClient>, id?: number) {
  queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
  if (id !== undefined) {
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
  }
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
    onSuccess: (order) => {
      invalidateOrderQueries(queryClient);
      toast.success(`Order ${order.order_number} berhasil dibuat.`);
    },
    onError: (error) => toast.error(error, "Gagal membuat order."),
  });
}

export function useUpdateOrder(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOrderPayload) => ordersApi.update(id, payload),
    onSuccess: () => {
      invalidateOrderQueries(queryClient, id);
      toast.success("Order berhasil diperbarui.");
    },
    onError: (error) => toast.error(error, "Gagal memperbarui order."),
  });
}

export function useUpdateOrderStatus(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: OrderStatus) => ordersApi.updateStatus(id, status),
    onSuccess: (order) => {
      invalidateOrderQueries(queryClient, id);
      toast.success(`Status order diubah ke "${order.status}".`);
    },
    onError: (error) => toast.error(error, "Gagal mengubah status order."),
  });
}

export function useUpdatePaymentStatus(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payment_status: PaymentStatus) => ordersApi.updatePaymentStatus(id, payment_status),
    onSuccess: (order) => {
      invalidateOrderQueries(queryClient, id);
      toast.success(`Status pembayaran diubah ke "${order.payment_status}".`);
    },
    onError: (error) => toast.error(error, "Gagal mengubah status pembayaran."),
  });
}

export function useCancelOrder(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ordersApi.cancel(id),
    onSuccess: () => {
      invalidateOrderQueries(queryClient, id);
      toast.success("Order dibatalkan.");
    },
    onError: (error) => toast.error(error, "Gagal membatalkan order."),
  });
}
