import { ProductCard } from '@/modules/products/ProductCard/ProductCard';
import { keyedProducts } from '@/modules/products/keyedProducts';

import styles from './ProductGrid.module.scss';

import type { ProductListItem } from '@/lib/api/types';

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  return (
    <ul className={styles.grid}>
      {keyedProducts(products).map(({ key, product }, index) => (
        <li key={key}>
          <ProductCard product={product} priority={index === 0} />
        </li>
      ))}
    </ul>
  );
}
