import Link from 'next/link';

import { Icon } from '@/components/Icon/Icon';

import styles from './Header.module.scss';

function cartLabel(count: number) {
  return `Cart, ${count} ${count === 1 ? 'product' : 'products'}`;
}

export function CartLink({ count }: { count: number }) {
  return (
    <Link href="/cart" className={styles.link} aria-label={cartLabel(count)}>
      <Icon name={count > 0 ? 'cart-active' : 'cart'} />
      <span className={styles.count}>{count}</span>
    </Link>
  );
}
