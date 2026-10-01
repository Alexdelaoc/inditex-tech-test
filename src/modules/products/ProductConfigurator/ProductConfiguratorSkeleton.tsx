import { Placeholder } from '@/components/Placeholder/Placeholder';

import styles from './ProductConfigurator.module.scss';

export function ProductConfiguratorSkeleton() {
  return (
    <div className={styles.detail} aria-hidden="true">
      <Placeholder className={styles.figure} />

      <div className={styles.info}>
        <div className={styles.identity}>
          <Placeholder className={styles.namePlaceholder} />
          <Placeholder className={styles.pricePlaceholder} />
        </div>

        <div className={styles.group}>
          <Placeholder className={styles.legendPlaceholder} />
          <Placeholder className={styles.storagePlaceholder} />
        </div>

        <div className={styles.group}>
          <Placeholder className={styles.legendPlaceholder} />
          <div className={styles.colorOptions}>
            <Placeholder className={styles.swatchesPlaceholder} />
          </div>
        </div>

        <Placeholder className={styles.addToCartPlaceholder} />
      </div>
    </div>
  );
}
