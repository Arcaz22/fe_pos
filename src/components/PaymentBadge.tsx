import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/types/order";

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; hsl: string }> = {
  pending: { label: "Menunggu Bayar", hsl: "38 92% 50%" },
  paid: { label: "Lunas", hsl: "142 71% 45%" },
  failed: { label: "Gagal", hsl: "0 72% 51%" },
  expired: { label: "Kedaluwarsa", hsl: "220 9% 55%" },
  refunded: { label: "Refund", hsl: "271 60% 55%" },
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config = PAYMENT_CONFIG[status];
  return (
    <Badge
      dotColor={`hsl(${config.hsl})`}
      style={{ backgroundColor: `hsl(${config.hsl} / 0.12)`, color: `hsl(${config.hsl})` }}
    >
      {config.label}
    </Badge>
  );
}
