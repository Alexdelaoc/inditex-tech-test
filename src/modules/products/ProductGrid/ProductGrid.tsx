import { ProductCard } from '@/modules/products/ProductCard/ProductCard';
import { withKeys } from '@/modules/products/withKeys';

import styles from './ProductGrid.module.scss';

import type { ProductListItem } from '@/lib/api/types';

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  return (
    <ul className={styles.grid}>
      {withKeys(products).map(({ key, product }) => (
        <li key={key}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
