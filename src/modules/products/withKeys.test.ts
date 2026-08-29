import { withKeys } from './withKeys';

import type { ProductListItem } from '@/lib/api/types';

function product(id: string): ProductListItem {
  return {
    id,
    brand: 'Brand',
    name: `Product ${id}`,
    basePrice: 100,
    imageUrl: 'https://example.com/product.jpg',
  };
}

describe('withKeys', () => {
  it('uses the id as the key', () => {
    expect(withKeys([product('a'), product('b')]).map(({ key }) => key)).toEqual(['a', 'b']);
  });

  it('suffixes a repeated id with the number of times it has appeared', () => {
    expect(withKeys([product('a'), product('a'), product('a')]).map(({ key }) => key)).toEqual([
      'a',
      'a-2',
      'a-3',
    ]);
  });

  it('gives a product the same key no matter where it sits in the list', () => {
    const full = withKeys([product('a'), product('b'), product('c')]);
    const filtered = withKeys([product('c')]);

    expect(filtered[0]?.key).toBe(full[2]?.key);
  });

  it('keeps the products in the order they arrived', () => {
    expect(withKeys([product('b'), product('a')]).map(({ product }) => product.id)).toEqual([
      'b',
      'a',
    ]);
  });
});
