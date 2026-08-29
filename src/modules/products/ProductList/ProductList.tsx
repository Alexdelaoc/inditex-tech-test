import { withKeys } from '@/modules/products/withKeys';

import type { ProductListItem } from '@/lib/api/types';

export function ProductList({ products }: { products: ProductListItem[] }) {
  return (
    <ul>
      {withKeys(products).map(({ key, product }) => (
        <li key={key}>
          <span>{product.brand}</span> <span>{product.name}</span>{' '}
          <span>{product.basePrice} EUR</span>
        </li>
      ))}
    </ul>
  );
}
