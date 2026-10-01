import { readCartEntries, resolveCartLines } from '@/modules/cart/cart';
import { CartView } from '@/modules/cart/CartView';

import styles from './page.module.scss';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cart',
};

export default async function CartPage() {
  const lines = await resolveCartLines(await readCartEntries());

  return (
    <div className={styles.page}>
      <CartView lines={lines} />
    </div>
  );
}
