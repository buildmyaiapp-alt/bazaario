"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "amazon_store_cart";

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, can't run during SSR render
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === item.productId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, item.stock);
        return prev.map((l) => (l.productId === item.productId ? { ...l, quantity: nextQty } : l));
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (productId, quantity) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(quantity, l.stock) } : l))
    );
  };

  const removeItem: CartContextValue["removeItem"] = (productId) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  };

  const clearCart = () => setLines([]);

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  return (
    <CartContext.Provider value={{ lines, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
