import { useMemo } from "react";
import { useCartStore } from "@/store/cart-store";
import type { OrderItemPayload } from "@/types/order";

export function useCart() {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const incrementQty = useCartStore((s) => s.incrementQty);
  const decrementQty = useCartStore((s) => s.decrementQty);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const setNotes = useCartStore((s) => s.setNotes);
  const removeItem = useCartStore((s) => s.removeItem);
  const loadItems = useCartStore((s) => s.loadItems);
  const clear = useCartStore((s) => s.clear);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const toPayloadItems = (): OrderItemPayload[] =>
    items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, notes: i.notes }));

  return {
    items,
    subtotal,
    itemCount,
    isEmpty: items.length === 0,
    addItem,
    incrementQty,
    decrementQty,
    setQuantity,
    setNotes,
    removeItem,
    loadItems,
    clear,
    toPayloadItems,
  };
}
