import { Carousel } from '@/modules/products/Carousel/Carousel';
import { ProductCard } from '@/modules/products/ProductCard/ProductCard';
import { withKeys } from '@/modules/products/withKeys';

import styles from './SimilarProducts.module.scss';

import type { ProductListItem } from '@/lib/api/types';

export function SimilarProducts({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Similar items</h2>

      <Carousel>
        {withKeys(products).map(({ key, product }) => (
          <li key={key} className={styles.item}>
            <ProductCard product={product} />
          </li>
        ))}
      </Carousel>
    </section>
  );
}
