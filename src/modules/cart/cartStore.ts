import { readCart, STORAGE_KEY, writeCart } from './cartStorage';

import type { CartLine } from './types';

export type NewCartLine = Omit<CartLine, 'id'>;

const EMPTY: CartLine[] = [];

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedLines: CartLine[] = EMPTY;

function nextLineId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', notify);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      window.removeEventListener('storage', notify);
    }
  };
}

export function getSnapshot(): CartLine[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLines = readCart();
  }

  return cachedLines;
}

export function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

export function addLine(line: NewCartLine) {
  writeCart([...getSnapshot(), { ...line, id: nextLineId() }]);
  notify();
}

export function removeLine(id: string) {
  writeCart(getSnapshot().filter((line) => line.id !== id));
  notify();
}
