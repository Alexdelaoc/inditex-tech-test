import styles from './ProductCard.module.scss';

export function ProductCardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <span className={`${styles.figure} ${styles.block}`} />

      <span className={styles.info}>
        <span className={styles.identity}>
          <span className={styles.block} data-line="brand" />
          <span className={styles.block} data-line="name" />
        </span>
        <span className={styles.block} data-line="price" />
      </span>
    </div>
  );
}
