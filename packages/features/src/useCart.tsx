import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Product, CartItem } from '@livedrop/core';

interface CartValue {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (productId: number) => void;
  clear: () => void;
  /** Subtotal in whole rupees. */
  total: number;
  /** Total quantity across lines. */
  count: number;
  open: boolean;
  toggle: () => void;
}

const CartContext = createContext<CartValue | undefined>(undefined);

/** Headless cart shared by web and mobile — quantity-merging add, totals. */
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const add = (product: Product) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, q: i.q + 1 } : i));
      }
      return [...prev, { ...product, q: 1 }];
    });

  const remove = (productId: number) => setItems((prev) => prev.filter((i) => i.id !== productId));
  const clear = () => setItems([]);
  const toggle = () => setOpen((o) => !o);

  const total = items.reduce((sum, i) => sum + i.price * i.q, 0);
  const count = items.reduce((sum, i) => sum + i.q, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, clear, total, count, open, toggle }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
