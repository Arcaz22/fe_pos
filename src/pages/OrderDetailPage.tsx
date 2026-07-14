import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { useOrder, useUpdateOrderStatus, useUpdatePaymentStatus, useCancelOrder } from "@/hooks/useOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getNextStatusActions, canCancel, canEdit } from "@/lib/status-transitions";
import type { PaymentStatus } from "@/types/order";

const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "pending", label: "Menunggu Bayar" },
  { value: "paid", label: "Lunas" },
  { value: "failed", label: "Gagal" },
  { value: "expired", label: "Kedaluwarsa" },
  { value: "refunded", label: "Refund" },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const navigate = useNavigate();

  const { data: order, isLoading } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus(orderId);
  const updatePaymentStatus = useUpdatePaymentStatus(orderId);
  const cancelOrder = useCancelOrder(orderId);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!order) {
    return <EmptyState title="Order tidak ditemukan" description="Order ini mungkin sudah dihapus atau ID salah." />;
  }

  const nextActions = getNextStatusActions(order.status);

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Order
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="numeric-emphasis text-2xl font-semibold tracking-tight">{order.order_number}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Antrian <span className="numeric-emphasis font-medium text-foreground">{order.queue_number}</span> · Dibuat{" "}
            {formatDateTime(order.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canEdit(order.status) && (
            <Button variant="outline" onClick={() => navigate(`/orders/${order.id}/edit`)}>
              <Pencil className="h-4 w-4" /> Edit Order
            </Button>
          )}
          {canCancel(order.status) && (
            <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => setCancelDialogOpen(true)}>
              Batalkan
            </Button>
          )}
          {nextActions.map((action) => (
            <Button
              key={action.status}
              onClick={() => updateStatus.mutate(action.status)}
              disabled={updateStatus.isPending}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Item Order</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.product_name_snapshot}</p>
                      {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                    </TableCell>
                    <TableCell className="text-center numeric-emphasis">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.line_total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-4 rounded-md bg-muted/60 p-3 text-sm">
                <p className="mb-1 font-medium">Catatan</p>
                <p className="text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Info Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pelanggan</span>
                <span className="font-medium">{order.customer_name ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipe</span>
                <span className="font-medium">{order.order_type === "dine_in" ? "Makan di Tempat" : "Bawa Pulang"}</span>
              </div>
              {order.order_type === "dine_in" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meja</span>
                  <span className="font-medium">{order.table_number ?? "-"}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metode Bayar</span>
                <span className="font-medium">{order.payment_method === "cash" ? "Tunai" : "Gateway"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PaymentBadge status={order.payment_status} />
              <Select
                value={order.payment_status}
                onValueChange={(v) => updatePaymentStatus.mutate(v as PaymentStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Batalkan order?"
        description={`Order ${order.order_number} akan dibatalkan dan tidak bisa diproses lagi.`}
        confirmLabel="Batalkan Order"
        isLoading={cancelOrder.isPending}
        onConfirm={() => cancelOrder.mutate(undefined, { onSuccess: () => setCancelDialogOpen(false) })}
      />
    </div>
  );
}
