import { ProductCardSkeleton } from '@/modules/products/ProductCard/ProductCardSkeleton';

import styles from './ProductGrid.module.scss';

const PLACEHOLDER_CARDS = 20;

export function ProductGridSkeleton() {
  return (
    <ul className={styles.grid} aria-hidden="true">
      {Array.from({ length: PLACEHOLDER_CARDS }, (_, index) => (
        <li key={index}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
