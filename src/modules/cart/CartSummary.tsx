import Link from 'next/link';

import styles from './CartView.module.scss';

export function CartSummary({ count, total }: { count: number; total: number }) {
  return (
    <div className={styles.footer}>
      {count > 0 && (
        <p className={styles.total}>
          <span>Total</span>
          <span>{total} EUR</span>
        </p>
      )}

      <Link href="/" className={styles.continue}>
        Continue shopping
      </Link>

      {count > 0 && (
        <button type="button" className={styles.pay} disabled>
          Pay
        </button>
      )}
    </div>
  );
}
