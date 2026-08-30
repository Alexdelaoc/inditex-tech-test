import { render, screen } from '@testing-library/react';

import { CartProvider } from '@/modules/cart/CartProvider';
import { writeCart } from '@/modules/cart/cartStorage';

import { Header } from './Header';

import type { CartLine } from '@/modules/cart/types';

const line: CartLine = {
  id: 'line-1',
  productId: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  imageUrl: 'https://example.com/violet.jpg',
  color: 'Titanium Violet',
  storage: '512GB',
  price: 1279,
};

function renderHeader(cartCount = 0) {
  writeCart(Array.from({ length: cartCount }, (_, index) => ({ ...line, id: `line-${index}` })));

  return render(
    <CartProvider>
      <Header />
    </CartProvider>,
  );
}

describe('Header', () => {
  it('links the logo to the home page', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
  });

  it('links to the cart', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: /cart/i })).toHaveAttribute('href', '/cart');
  });

  it('shows the empty cart icon and a zero counter when the cart is empty', () => {
    const { container } = renderHeader(0);

    expect(container.querySelector('[data-icon="cart"]')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows the filled cart icon and the counter when there are products', () => {
    const { container } = renderHeader(3);

    expect(container.querySelector('[data-icon="cart-active"]')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('announces how many products the cart holds', () => {
    renderHeader(1);

    expect(screen.getByRole('link', { name: 'Cart, 1 product' })).toBeInTheDocument();
  });

  it('announces an empty cart', () => {
    renderHeader(0);

    expect(screen.getByRole('link', { name: 'Cart, 0 products' })).toBeInTheDocument();
  });
});
