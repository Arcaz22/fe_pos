import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OrderStatus, PaymentStatus } from "@/types/order";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Menunggu" },
  { value: "in_progress", label: "Diproses" },
  { value: "ready", label: "Siap" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "pending", label: "Menunggu Bayar" },
  { value: "paid", label: "Lunas" },
  { value: "failed", label: "Gagal" },
  { value: "expired", label: "Kedaluwarsa" },
  { value: "refunded", label: "Refund" },
];

interface OrderFilterControlsProps {
  status?: OrderStatus;
  onStatusChange: (value: OrderStatus | undefined) => void;
  paymentStatus?: PaymentStatus;
  onPaymentStatusChange: (value: PaymentStatus | undefined) => void;
}

/** Dipakai sebagai children di dalam <FilterBar> pada halaman Order List. */
export function OrderFilterControls({
  status,
  onStatusChange,
  paymentStatus,
  onPaymentStatusChange,
}: OrderFilterControlsProps) {
  return (
    <>
      <Select value={status ?? "all"} onValueChange={(v) => onStatusChange(v === "all" ? undefined : (v as OrderStatus))}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={paymentStatus ?? "all"}
        onValueChange={(v) => onPaymentStatusChange(v === "all" ? undefined : (v as PaymentStatus))}
      >
        <SelectTrigger className="w-42.5">
          <SelectValue placeholder="Semua Pembayaran" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Pembayaran</SelectItem>
          {PAYMENT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
