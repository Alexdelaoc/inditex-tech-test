'use client';

import { createContext, use, useOptimistic } from 'react';

import { removeFromCart } from './actions';

import type { CartEntry } from './types';
import type { ReactNode } from 'react';

interface CartValue {
  entries: CartEntry[];
  count: number;
  removeLine: (lineId: string) => Promise<void>;
}

export const CartContext = createContext<CartValue>({
  entries: [],
  count: 0,
  removeLine: async () => {},
});

interface CartProviderProps {
  entries: CartEntry[];
  children: ReactNode;
}

export function CartProvider({ entries, children }: CartProviderProps) {
  const [optimisticEntries, removeOptimistically] = useOptimistic(
    entries,
    (current, removedId: string) => current.filter((entry) => entry.id !== removedId),
  );

  async function removeLine(lineId: string) {
    removeOptimistically(lineId);
    await removeFromCart(lineId);
  }

  return (
    <CartContext.Provider
      value={{ entries: optimisticEntries, count: optimisticEntries.length, removeLine }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return use(CartContext);
}
