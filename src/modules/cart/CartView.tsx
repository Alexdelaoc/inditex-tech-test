'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useCart } from './CartProvider';

import styles from './CartView.module.scss';

const SIZES = '(min-width: 48rem) 232px, 96px';

export function CartView() {
  const { lines, count, total, removeLine } = useCart();

  return (
    <>
      <h1 className={styles.title}>Cart ({count})</h1>

      {count > 0 && (
        <ul className={styles.lines}>
          {lines.map((line) => (
            <li key={line.id} className={styles.line}>
              <span className={styles.figure}>
                <Image src={line.imageUrl} alt="" fill sizes={SIZES} className={styles.image} />
              </span>

              <div className={styles.info}>
                <div className={styles.identity}>
                  <p className={styles.name}>{line.name}</p>
                  <p className={styles.variant}>
                    {line.color} | {line.storage}
                  </p>
                </div>

                <p className={styles.price}>{line.price} EUR</p>

                <button
                  type="button"
                  aria-label={`Delete ${line.name}, ${line.color}, ${line.storage}`}
                  className={styles.delete}
                  onClick={() => removeLine(line.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

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
    </>
  );
}
