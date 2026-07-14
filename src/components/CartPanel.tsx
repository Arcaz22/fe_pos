import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency } from "@/lib/format";
import type { CartItem } from "@/store/cart-store";

// Tipe eksplisit untuk props CartPanel — dibuat manual (bukan ReturnType<typeof useCart>)
// supaya tidak gantung ke inference yang kadang gagal resolve di beberapa setup TS/bundler.
interface CartPanelProps {
  cart: {
    items: CartItem[];
    isEmpty: boolean;
    incrementQty: (productId: number) => void;
    decrementQty: (productId: number) => void;
    removeItem: (productId: number) => void;
  };
}

export function CartPanel({ cart }: CartPanelProps) {
  if (cart.isEmpty) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Keranjang masih kosong"
        description="Pilih produk di sebelah kiri untuk mulai membuat order."
      />
    );
  }

  return (
    <div className="space-y-3">
      {cart.items.map((item: CartItem) => (
        <div key={item.product_id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(item.unit_price)} × {item.quantity} ={" "}
              <span className="font-medium text-foreground">{formatCurrency(item.unit_price * item.quantity)}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => cart.decrementQty(item.product_id)}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-6 text-center text-sm numeric-emphasis">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => cart.incrementQty(item.product_id)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => cart.removeItem(item.product_id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
