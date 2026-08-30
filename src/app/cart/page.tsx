import { CartView } from '@/modules/cart/CartView';

import styles from './page.module.scss';

export default function CartPage() {
  return (
    <div className={styles.page}>
      <CartView />
    </div>
  );
}
