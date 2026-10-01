import Image from 'next/image';

import styles from './CartView.module.scss';

import type { CartLine } from './types';

const SIZES = '(min-width: 48rem) 232px, 96px';

interface CartLineItemProps {
  line: CartLine;
  removeAction: (formData: FormData) => void | Promise<void>;
}

export function CartLineItem({ line, removeAction }: CartLineItemProps) {
  return (
    <li className={styles.line}>
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

        <form action={removeAction} className={styles.remove}>
          <button
            type="submit"
            aria-label={`Delete ${line.name}, ${line.color}, ${line.storage}`}
            className={styles.delete}
          >
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}
