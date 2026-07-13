import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useOrderFilters } from "@/hooks/useOrderFilters";
import { usePagination } from "@/hooks/usePagination";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { OrderFilterControls } from "@/components/OrderFilterControls";
import { PaginationControls } from "@/components/PaginationControls";
import { StatusBadge } from "@/components/StatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Order } from "@/types/order";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { filters, setFilter, clearFilters, hasActiveFilters } = useOrderFilters();
  const pagination = usePagination();

  const { data, isLoading } = useOrders({
    ...filters,
    offset: pagination.offset,
    limit: pagination.limit,
  });
  const orders = data?.items;

  const columns: DataTableColumn<Order>[] = [
    {
      key: "queue_number",
      header: "Antrian",
      render: (o) => <span className="numeric-emphasis font-semibold">{o.queue_number}</span>,
    },
    {
      key: "order_number",
      header: "No. Order",
      render: (o) => <span className="numeric-emphasis">{o.order_number}</span>,
    },
    { key: "customer_name", header: "Pelanggan", render: (o) => o.customer_name ?? "-" },
    {
      key: "order_type",
      header: "Tipe",
      render: (o) => (o.order_type === "dine_in" ? `Makan di Tempat${o.table_number ? ` · Meja ${o.table_number}` : ""}` : "Bawa Pulang"),
    },
    { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
    { key: "payment_status", header: "Pembayaran", render: (o) => <PaymentBadge status={o.payment_status} /> },
    { key: "total", header: "Total", render: (o) => formatCurrency(o.total_amount), className: "text-right" },
    { key: "created_at", header: "Dibuat", render: (o) => formatDateTime(o.created_at) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Order</h1>
          <p className="text-sm text-muted-foreground">Semua order yang masuk, bisa difilter per status & pembayaran.</p>
        </div>
        <Button onClick={() => navigate("/orders/new")}>
          <Plus className="h-4 w-4" /> Order Baru
        </Button>
      </div>

      <FilterBar
        searchValue={filters.order_number ?? ""}
        onSearchChange={(v) => {
          setFilter("order_number", v || undefined);
          pagination.reset();
        }}
        searchPlaceholder="Cari nomor order..."
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          clearFilters();
          pagination.reset();
        }}
      >
        <OrderFilterControls
          status={filters.status}
          onStatusChange={(v) => {
            setFilter("status", v);
            pagination.reset();
          }}
          paymentStatus={filters.payment_status}
          onPaymentStatusChange={(v) => {
            setFilter("payment_status", v);
            pagination.reset();
          }}
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        getRowKey={(o) => o.id}
        onRowClick={(o) => navigate(`/orders/${o.id}`)}
        emptyTitle="Belum ada order"
        emptyDescription={hasActiveFilters ? "Tidak ada order yang cocok dengan filter ini." : "Order baru akan muncul di sini."}
      />

      {!isLoading && data && (
        <PaginationControls
          offset={pagination.offset}
          limit={pagination.limit}
          total={data.total}
          currentCount={orders?.length ?? 0}
          hasPrevPage={pagination.hasPrevPage}
          hasNextPage={pagination.hasNextPage(data.total)}
          onPrev={pagination.prevPage}
          onNext={pagination.nextPage}
        />
      )}
    </div>
  );
}
