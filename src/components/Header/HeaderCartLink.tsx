'use client';

import { useCart } from '@/modules/cart/CartProvider';

import { CartLink } from './CartLink';

export function HeaderCartLink() {
  const { count } = useCart();

  return <CartLink count={count} />;
}
