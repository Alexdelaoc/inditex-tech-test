import Link from 'next/link';

import { Icon } from '@/components/Icon/Icon';

import styles from './Header.module.scss';

interface HeaderProps {
  cartCount?: number;
}

function cartLabel(cartCount: number) {
  return `Cart, ${cartCount} ${cartCount === 1 ? 'product' : 'products'}`;
}

export function Header({ cartCount = 0 }: HeaderProps) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.link} aria-label="Zara Web Challenge, go to home">
        <Icon name="logo" className={styles.logo} />
      </Link>

      <Link href="/cart" className={styles.link} aria-label={cartLabel(cartCount)}>
        <Icon name={cartCount > 0 ? 'cart-active' : 'cart'} />
        <span className={styles.count}>{cartCount}</span>
      </Link>
    </header>
  );
}
