'use client';

import { CartLineItem } from './CartLineItem';
import { useCart } from './CartProvider';
import { CartSummary } from './CartSummary';

import styles from './CartView.module.scss';

import type { CartLine } from './types';

export function CartView({ lines }: { lines: CartLine[] }) {
  const { entries, removeLine } = useCart();
  const remaining = new Set(entries.map((entry) => entry.id));
  const shown = lines.filter((line) => remaining.has(line.id));
  const total = shown.reduce((sum, line) => sum + line.price, 0);

  return (
    <>
      <h1 className={styles.title}>Cart ({shown.length})</h1>

      {shown.length > 0 && (
        <ul className={styles.lines}>
          {shown.map((line) => (
            <CartLineItem key={line.id} line={line} removeAction={removeLine.bind(null, line.id)} />
          ))}
        </ul>
      )}

      <CartSummary count={shown.length} total={total} />
    </>
  );
}
