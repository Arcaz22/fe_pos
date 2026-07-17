import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { ProductPicker } from "@/components/ProductPicker";
import { CartPanel } from "@/components/CartPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import { useOrder, useUpdateOrder } from "@/hooks/useOrders";
import { editOrderSchema, type EditOrderFormValues } from "@/schemas/order-schema";
import { toast } from "@/lib/toast";
import { canEdit } from "@/lib/status-transitions";

function SegmentedField<T extends string>({
  value,
  onChange,
  options,
  disabled,
  disabledValues = [],
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
  disabledValues?: T[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const isDisabled = disabled || disabledValues.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => !isDisabled && onChange(opt.value)}
            disabled={isDisabled}
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              value === opt.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
              isDisabled && "cursor-not-allowed opacity-50 hover:bg-background"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function OrderEditPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const navigate = useNavigate();
  const cart = useCart();
  const { data: order, isLoading } = useOrder(orderId);
  const updateOrder = useUpdateOrder(orderId);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditOrderFormValues>({
    resolver: zodResolver(editOrderSchema),
    defaultValues: { customer_name: "", order_type: "dine_in", table_number: "", payment_method: "cash", notes: "" },
  });

  const orderType = watch("order_type");
  const isPaymentMethodLocked = order?.payment_status !== "pending";

  // Preload cart & form sekali saat data order pertama kali datang
  const hasPreloaded = useRef(false);
  useEffect(() => {
    if (order && !hasPreloaded.current) {
      hasPreloaded.current = true;
      cart.loadItems(
        order.items.map((item) => ({
          product_id: item.product_id,
          name: item.product_name_snapshot,
          unit_price: parseFloat(item.unit_price),
          quantity: item.quantity,
          notes: item.notes,
        }))
      );
      reset({
        customer_name: order.customer_name ?? "",
        order_type: order.order_type,
        table_number: order.table_number ?? "",
        payment_method: order.payment_method,
        notes: order.notes ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const onSubmit = (values: EditOrderFormValues) => {
    if (cart.isEmpty) {
      toast.info("Order minimal harus punya 1 item.");
      return;
    }
    updateOrder.mutate(
      {
        customer_name: values.customer_name || null,
        order_type: values.order_type,
        table_number: values.order_type === "dine_in" ? values.table_number || null : null,
        payment_method: values.payment_method,
        notes: values.notes || null,
        items: cart.toPayloadItems(),
      },
      { onSuccess: () => navigate(`/orders/${orderId}`) }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!order) {
    return <EmptyState title="Order tidak ditemukan" />;
  }

  if (!canEdit(order.status)) {
    return (
      <EmptyState
        title="Order tidak bisa diedit"
        description={`Order dengan status "${order.status}" sudah tidak bisa diubah lagi.`}
        action={
          <Button variant="outline" onClick={() => navigate(`/orders/${orderId}`)}>
            Kembali ke Detail Order
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(`/orders/${orderId}`)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Detail Order
      </button>

      <div>
        <h1 className="numeric-emphasis text-2xl font-semibold tracking-tight">Edit {order.order_number}</h1>
        <p className="text-sm text-muted-foreground">Ubah item atau detail order sebelum diproses lebih lanjut.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Pilih Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductPicker onAdd={cart.addItem} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Keranjang ({cart.itemCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <CartPanel cart={cart} />
              {!cart.isEmpty && (
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm font-medium">Subtotal</span>
                  <span className="text-base font-semibold">{formatCurrency(cart.subtotal)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Detail Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Tipe Order</Label>
                  <Controller
                    control={control}
                    name="order_type"
                    render={({ field }) => (
                      <SegmentedField
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: "dine_in", label: "Makan di Tempat" },
                          { value: "takeaway", label: "Bawa Pulang" },
                        ]}
                      />
                    )}
                  />
                </div>

                {orderType === "dine_in" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="table_number">Nomor Meja</Label>
                    <Input id="table_number" placeholder="Misal: 12" {...register("table_number")} />
                    {errors.table_number && <p className="text-xs text-destructive">{errors.table_number.message}</p>}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="customer_name">Nama Pelanggan (opsional)</Label>
                  <Input id="customer_name" placeholder="Budi" {...register("customer_name")} />
                </div>

                <div className="space-y-1.5">
                  <Label>Metode Pembayaran</Label>
                  <Controller
                    control={control}
                    name="payment_method"
                    render={({ field }) => (
                      <SegmentedField
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: "cash", label: "Tunai" },
                          { value: "gateway", label: "Gateway" },
                        ]}
                        disabled={isPaymentMethodLocked}
                        disabledValues={["gateway"]}
                      />
                    )}
                  />
                  {isPaymentMethodLocked ? (
                    <p className="text-xs text-muted-foreground">Metode pembayaran tidak bisa diubah setelah pembayaran diproses.</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Payment gateway belum tersedia.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Catatan (opsional)</Label>
                  <Textarea id="notes" placeholder="Contoh: tidak pedas, es dipisah, dll" {...register("notes")} />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={updateOrder.isPending || cart.isEmpty}>
                  {updateOrder.isPending ? "Menyimpan..." : `Simpan Perubahan · ${formatCurrency(cart.subtotal)}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
