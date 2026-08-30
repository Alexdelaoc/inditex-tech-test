'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { readCart, writeCart } from './cartStorage';

import type { CartLine } from './types';
import type { ReactNode } from 'react';

export type NewCartLine = Omit<CartLine, 'id'>;

function nextLineId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

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
  const [lines, setLines] = useState<CartLine[]>([]);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    setLines(readCart());
    setRestored(true);
  }, []);

  useEffect(() => {
    if (restored) {
      writeCart(lines);
    }
  }, [lines, restored]);

  const addLine = useCallback((line: NewCartLine) => {
    setLines((current) => [...current, { ...line, id: nextLineId() }]);
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((current) => current.filter((line) => line.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      lines,
      count: lines.length,
      total: lines.reduce((sum, line) => sum + line.price, 0),
      addLine,
      removeLine,
    }),
    [lines, addLine, removeLine],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
