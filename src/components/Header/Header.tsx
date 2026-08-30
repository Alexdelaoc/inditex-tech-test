'use client';

import Link from 'next/link';

import { Icon } from '@/components/Icon/Icon';
import { useCart } from '@/modules/cart/CartProvider';

import styles from './Header.module.scss';

function cartLabel(cartCount: number) {
  return `Cart, ${cartCount} ${cartCount === 1 ? 'product' : 'products'}`;
}

export function Header() {
  const { count } = useCart();

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.link} aria-label="Zara Web Challenge, go to home">
        <Icon name="logo" className={styles.logo} />
      </Link>

      <Link href="/cart" className={styles.link} aria-label={cartLabel(count)}>
        <Icon name={count > 0 ? 'cart-active' : 'cart'} />
        <span className={styles.count}>{count}</span>
      </Link>
    </header>
  );
}
