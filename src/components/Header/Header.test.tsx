import { render, screen } from '@testing-library/react';

import { CartProvider } from '@/modules/cart/CartProvider';
import { aCartLine, anEntryFor } from '@/test/fixtures';

import { Header } from './Header';

import type { CartEntry } from '@/modules/cart/types';

jest.mock('@/modules/cart/actions', () => ({ removeFromCart: jest.fn(), addToCart: jest.fn() }));

function renderHeader(entries: CartEntry[] = []) {
  return render(
    <CartProvider entries={entries}>
      <Header />
    </CartProvider>,
  );
}

describe('Header', () => {
  it('links the logo to the home page', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
  });

  it('shows how many products the cart holds', () => {
    renderHeader(['a', 'b', 'c'].map((id) => anEntryFor(aCartLine({ id }))));

    expect(screen.getByRole('link', { name: 'Cart, 3 products' })).toBeInTheDocument();
  });

  it('shows an empty cart for a shopper who has not added anything', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: 'Cart, 0 products' })).toBeInTheDocument();
  });
});
