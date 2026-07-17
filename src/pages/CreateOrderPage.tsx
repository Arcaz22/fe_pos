import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { ProductPicker } from "@/components/ProductPicker";
import { CartPanel } from "@/components/CartPanel";
import { CashPaymentDialog } from "@/components/CashPaymentDialog";
import { OpenCashSessionDialog } from "@/components/OpenCashSessionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ordersApi } from "@/api/orders";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { useCart } from "@/hooks/useCart";
import { useCurrentCashSession } from "@/hooks/useCashSession";
import { useCreateOrder } from "@/hooks/useOrders";
import { createOrderSchema, type CreateOrderFormValues } from "@/schemas/order-schema";
import { toast } from "@/lib/toast";
import type { CreateOrderPayload } from "@/types/order";

// Segmented toggle sederhana untuk pilihan 2 opsi (order_type, payment_method)
function SegmentedField<T extends string>({
  value,
  onChange,
  options,
  disabledValues = [],
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  disabledValues?: T[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => !disabledValues.includes(opt.value) && onChange(opt.value)}
          disabled={disabledValues.includes(opt.value)}
          className={cn(
            "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
            value === opt.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-muted",
            disabledValues.includes(opt.value) && "cursor-not-allowed opacity-50 hover:bg-background"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cart = useCart();
  const createOrder = useCreateOrder();
  const currentCashSession = useCurrentCashSession();
  const [cashDialogOpen, setCashDialogOpen] = useState(false);
  const [openSessionDialogOpen, setOpenSessionDialogOpen] = useState(false);
  const [pendingCashPayload, setPendingCashPayload] = useState<CreateOrderPayload | null>(null);

  const createPaidCashOrder = useMutation({
    mutationFn: async ({ payload, cashReceived }: { payload: CreateOrderPayload; cashReceived: number }) => {
      const order = await ordersApi.create(payload);
      return ordersApi.updatePaymentStatus(order.id, "paid", cashReceived);
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashSessions.current });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashSessions.all });
      cart.clear();
      setPendingCashPayload(null);
      setCashDialogOpen(false);
      toast.success(`Order ${order.order_number} berhasil dibuat dan dibayar tunai.`);
      navigate(`/orders/${order.id}`);
    },
    onError: (error) => toast.error(error, "Gagal membuat order tunai."),
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: { customer_name: "", order_type: "dine_in", table_number: "", payment_method: "cash", notes: "" },
  });

  const orderType = watch("order_type");

  // Bersihkan cart setiap kali masuk ke halaman ini dari luar (mulai order baru dari nol)
  useEffect(() => {
    cart.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (values: CreateOrderFormValues) => {
    if (cart.isEmpty) {
      toast.info("Tambahkan minimal 1 produk ke keranjang dulu.");
      return;
    }

    const payload: CreateOrderPayload = {
      customer_name: values.customer_name || null,
      order_type: values.order_type,
      table_number: values.order_type === "dine_in" ? values.table_number || null : null,
      payment_method: values.payment_method,
      notes: values.notes || null,
      items: cart.toPayloadItems(),
    };

    if (values.payment_method === "cash") {
      if (!currentCashSession.data) {
        setPendingCashPayload(payload);
        setOpenSessionDialogOpen(true);
        toast.info("Buka sesi kas dulu sebelum menerima pembayaran tunai.");
        return;
      }
      setPendingCashPayload(payload);
      setCashDialogOpen(true);
      return;
    }

    createOrder.mutate(payload, {
      onSuccess: (order) => {
        cart.clear();
        navigate(`/orders/${order.id}`);
      },
    });
  };

  const isSubmitting = createOrder.isPending || createPaidCashOrder.isPending;

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Order
      </button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Buat Order Baru</h1>
        <p className="text-sm text-muted-foreground">Pilih produk, atur detail order, lalu submit.</p>
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
                        disabledValues={["gateway"]}
                      />
                    )}
                  />
                  <p className="text-xs text-muted-foreground">Payment gateway belum tersedia.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Catatan (opsional)</Label>
                  <Textarea id="notes" placeholder="Contoh: tidak pedas, es dipisah, dll" {...register("notes")} />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || cart.isEmpty || currentCashSession.isLoading}
                >
                  {isSubmitting ? "Membuat Order..." : `Buat Order · ${formatCurrency(cart.subtotal)}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <CashPaymentDialog
        open={cashDialogOpen}
        onOpenChange={(open) => {
          setCashDialogOpen(open);
          if (!open) setPendingCashPayload(null);
        }}
        totalAmount={cart.subtotal}
        isLoading={createPaidCashOrder.isPending}
        onConfirm={(cashReceived) => {
          if (!pendingCashPayload) return;
          createPaidCashOrder.mutate({ payload: pendingCashPayload, cashReceived });
        }}
      />
      <OpenCashSessionDialog
        open={openSessionDialogOpen}
        onOpenChange={(open) => {
          setOpenSessionDialogOpen(open);
          if (!open) setPendingCashPayload(null);
        }}
      />
    </div>
  );
}
