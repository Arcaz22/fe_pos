import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Clock, CookingPot, PackageCheck } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Order } from "@/types/order";

const STAT_CARDS = [
  { status: "pending" as const, label: "Menunggu", icon: Clock },
  { status: "in_progress" as const, label: "Diproses", icon: CookingPot },
  { status: "ready" as const, label: "Siap Diambil", icon: PackageCheck },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  // Ambil semua order aktif (belum selesai/batal) untuk dashboard operasional
  const { data, isLoading } = useOrders({ limit: 100 });
  const orders = data?.items;

  const activeOrders = useMemo(
    () => (orders ?? []).filter((o) => o.status !== "completed" && o.status !== "cancelled"),
    [orders]
  );

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = { pending: 0, in_progress: 0, ready: 0 };
    for (const o of orders ?? []) {
      if (o.status in counts) counts[o.status] += 1;
    }
    return counts;
  }, [orders]);

  const columns: DataTableColumn<Order>[] = [
    {
      key: "queue_number",
      header: "Antrian",
      render: (o) => <span className="numeric-emphasis font-semibold">{o.queue_number}</span>,
    },
    { key: "order_number", header: "No. Order", render: (o) => <span className="numeric-emphasis">{o.order_number}</span> },
    { key: "customer_name", header: "Pelanggan", render: (o) => o.customer_name ?? "-" },
    { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
    { key: "payment_status", header: "Pembayaran", render: (o) => <PaymentBadge status={o.payment_status} /> },
    { key: "total", header: "Total", render: (o) => formatCurrency(o.total_amount), className: "text-right" },
    { key: "created_at", header: "Dibuat", render: (o) => formatDateTime(o.created_at) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ringkasan order yang perlu perhatian saat ini.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          : STAT_CARDS.map(({ status, label, icon: Icon }) => (
              <Card key={status}>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>{label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-0">
                  <span className="text-2xl font-semibold">{countByStatus[status]}</span>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Order Aktif</h2>
        </div>
        <DataTable
          columns={columns}
          data={activeOrders}
          isLoading={isLoading}
          getRowKey={(o) => o.id}
          onRowClick={(o) => navigate(`/orders/${o.id}`)}
          emptyTitle="Tidak ada order aktif"
          emptyDescription="Semua order sudah selesai diproses."
        />
      </div>
    </div>
  );
}
