import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/order";

// Simpan komponen HSL mentah (tanpa wrapper hsl()) biar gampang bikin versi solid & versi transparan
const STATUS_CONFIG: Record<OrderStatus, { label: string; hsl: string }> = {
  pending: { label: "Menunggu", hsl: "38 92% 50%" },
  in_progress: { label: "Diproses", hsl: "217 91% 60%" },
  ready: { label: "Siap", hsl: "142 71% 45%" },
  completed: { label: "Selesai", hsl: "222 15% 35%" },
  cancelled: { label: "Dibatalkan", hsl: "0 72% 51%" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      dotColor={`hsl(${config.hsl})`}
      style={{ backgroundColor: `hsl(${config.hsl} / 0.12)`, color: `hsl(${config.hsl})` }}
    >
      {config.label}
    </Badge>
  );
}
