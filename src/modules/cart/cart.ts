import { cookies } from 'next/headers';

import { getProduct } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { configure } from '@/modules/products/configuration';

import { CART_COOKIE, decodeCart } from './cartCookie';

import type { CartEntry, CartLine } from './types';
import type { Product } from '@/lib/api/types';

export async function readCartEntries(): Promise<CartEntry[]> {
  return decodeCart((await cookies()).get(CART_COOKIE)?.value);
}

async function findProduct(id: string): Promise<Product | undefined> {
  try {
    return await getProduct(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }

    throw error;
  }
}

export async function resolveCartLines(entries: CartEntry[]): Promise<CartLine[]> {
  const productIds = [...new Set(entries.map((entry) => entry.productId))];
  const products = new Map(
    await Promise.all(productIds.map(async (id) => [id, await findProduct(id)] as const)),
  );

  return entries.flatMap((entry) => {
    const product = products.get(entry.productId);
    const configuration = product ? configure(product, entry) : null;

    if (!product || !configuration) {
      return [];
    }

    return [
      {
        ...entry,
        name: product.name,
        imageUrl: configuration.imageUrl,
        price: configuration.price,
      },
    ];
  });
}
