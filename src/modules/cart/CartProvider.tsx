'use client';

import { createContext, use, useMemo, useSyncExternalStore } from 'react';

import { addLine, getServerSnapshot, getSnapshot, removeLine, subscribe } from './cartStore';

import type { NewCartLine } from './cartStore';
import type { CartLine } from './types';
import type { ReactNode } from 'react';

interface CartValue {
  lines: CartLine[];
  count: number;
  total: number;
  addLine: (line: NewCartLine) => void;
  removeLine: (id: string) => void;
}

export const CartContext = createContext<CartValue>({
  lines: [],
  count: 0,
  total: 0,
  addLine: () => {},
  removeLine: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo(
    () => ({
      lines,
      count: lines.length,
      total: lines.reduce((sum, line) => sum + line.price, 0),
      addLine,
      removeLine,
    }),
    [lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return use(CartContext);
}
