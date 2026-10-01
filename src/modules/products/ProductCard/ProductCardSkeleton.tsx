import { Placeholder } from '@/components/Placeholder/Placeholder';

import styles from './ProductCard.module.scss';

export function ProductCardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <Placeholder className={styles.figure} />

      <span className={styles.info}>
        <span className={styles.identity}>
          <Placeholder className={styles.brandPlaceholder} />
          <Placeholder className={styles.namePlaceholder} />
        </span>
        <Placeholder className={styles.pricePlaceholder} />
      </span>
    </div>
  );
}
