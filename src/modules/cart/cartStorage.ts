import type { CartLine } from './types';

export const STORAGE_KEY = 'cart';

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const line = value as Record<keyof CartLine, unknown>;

  return (
    typeof line.id === 'string' &&
    typeof line.productId === 'string' &&
    typeof line.brand === 'string' &&
    typeof line.name === 'string' &&
    typeof line.imageUrl === 'string' &&
    typeof line.color === 'string' &&
    typeof line.storage === 'string' &&
    typeof line.price === 'number'
  );
}

export function readCart(): CartLine[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // A full or unavailable storage must not break the cart in memory.
  }
}
