import type { OrderStatus } from "@/types/order";
import { ORDER_STATUS_TRANSITIONS } from "@/types/order";

interface StatusAction {
  status: OrderStatus;
  label: string;
  variant: "default" | "destructive";
}

const STATUS_ACTION_LABEL: Record<OrderStatus, string> = {
  pending: "Tandai Menunggu",
  in_progress: "Mulai Proses",
  ready: "Tandai Siap",
  completed: "Selesaikan Order",
  cancelled: "Batalkan Order",
};

export function getNextStatusActions(current: OrderStatus): StatusAction[] {
  return ORDER_STATUS_TRANSITIONS[current]
    .filter((s) => s !== "cancelled")
    .map((status) => ({
      status,
      label: STATUS_ACTION_LABEL[status],
      variant: "default" as const,
    }));
}

export function canCancel(current: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[current].includes("cancelled");
}

export function canEdit(current: OrderStatus): boolean {
  return current === "pending" || current === "in_progress";
}
