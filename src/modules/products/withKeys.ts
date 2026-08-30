import type { ProductListItem } from '@/lib/api/types';

export interface KeyedProduct {
  key: string;
  product: ProductListItem;
}

export function withKeys(products: ProductListItem[]): KeyedProduct[] {
  const occurrences = new Map<string, number>();

  return products.map((product) => {
    const occurrence = (occurrences.get(product.id) ?? 0) + 1;
    occurrences.set(product.id, occurrence);

    return {
      key: occurrence === 1 ? product.id : `${product.id}-${occurrence}`,
      product,
    };
  });
}
