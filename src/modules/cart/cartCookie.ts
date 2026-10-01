import type { CartEntry } from './types';

export const CART_COOKIE = 'cart';

const MAX_VALUE_BYTES = 3900;
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

type StoredEntry = [id: string, productId: string, color: string, storage: string];

function isStoredEntry(value: unknown): value is StoredEntry {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((field) => typeof field === 'string' && field.length > 0)
  );
}

export function encodeCart(entries: CartEntry[]): string {
  const stored: StoredEntry[] = entries.map(({ id, productId, color, storage }) => [
    id,
    productId,
    color,
    storage,
  ]);

  return Buffer.from(JSON.stringify(stored)).toString('base64url');
}

export function decodeCart(raw: string | undefined): CartEntry[] {
  if (!raw) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const seen = new Set<string>();

  return parsed.filter(isStoredEntry).flatMap(([id, productId, color, storage]) => {
    if (seen.has(id)) {
      return [];
    }

    seen.add(id);

    return [{ id, productId, color, storage }];
  });
}

export function exceedsCookieLimit(encoded: string): boolean {
  return encoded.length > MAX_VALUE_BYTES;
}

export function cartCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: THIRTY_DAYS_IN_SECONDS,
    secure,
  } as const;
}
