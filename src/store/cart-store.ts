import { create } from "zustand";

export interface CartItem {
  product_id: number;
  name: string;
  unit_price: number;
  quantity: number;
  notes: string | null;
}

interface CartState {
  items: CartItem[];
  addItem: (product: { id: number; name: string; price: number }) => void;
  incrementQty: (productId: number) => void;
  decrementQty: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  setNotes: (productId: number, notes: string) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.product_id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { product_id: product.id, name: product.name, unit_price: product.price, quantity: 1, notes: null },
        ],
      };
    }),

  incrementQty: (productId) =>
    set((state) => ({
      items: state.items.map((i) => (i.product_id === productId ? { ...i, quantity: i.quantity + 1 } : i)),
    })),

  decrementQty: (productId) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.product_id === productId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    })),

  setQuantity: (productId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((i) => i.product_id !== productId)
          : state.items.map((i) => (i.product_id === productId ? { ...i, quantity } : i)),
    })),

  setNotes: (productId, notes) =>
    set((state) => ({
      items: state.items.map((i) => (i.product_id === productId ? { ...i, notes } : i)),
    })),

  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.product_id !== productId) })),

  clear: () => set({ items: [] }),
}));
