import { useFormStatus } from 'react-dom';

import styles from './ProductConfigurator.module.scss';

export function AddToCartButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.addToCart} disabled={disabled || pending}>
      Add
    </button>
  );
}
