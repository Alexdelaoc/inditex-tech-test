import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CartProvider } from './CartProvider';
import { CartView } from './CartView';
import { writeCart } from './cartStorage';

import type { CartLine } from './types';

const galaxy: CartLine = {
  id: 'line-1',
  productId: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  imageUrl: 'https://example.com/violet.jpg',
  color: 'Titanium Violet',
  storage: '512GB',
  price: 1279,
};

const pixel: CartLine = {
  id: 'line-2',
  productId: 'GPX-8A',
  brand: 'Google',
  name: 'Pixel 8a',
  imageUrl: 'https://example.com/pixel.jpg',
  color: 'Obsidian',
  storage: '128GB',
  price: 459,
};

function setup(lines: CartLine[]) {
  writeCart(lines);
  const user = userEvent.setup();
  render(
    <CartProvider>
      <CartView />
    </CartProvider>,
  );

  return user;
}

describe('CartView', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('counts the products in the title', () => {
    setup([galaxy, pixel]);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cart (2)');
  });

  it('shows the brand, the name, the chosen configuration and the price of each line', () => {
    setup([galaxy, pixel]);

    const line = within(screen.getAllByRole('listitem')[0]!);

    expect(line.getByText('Samsung')).toBeInTheDocument();
    expect(line.getByText('Galaxy S24 Ultra')).toBeInTheDocument();
    expect(line.getByText('Titanium Violet | 512GB')).toBeInTheDocument();
    expect(line.getByText('1279 EUR')).toBeInTheDocument();
  });

  it('adds up the prices of the lines', () => {
    setup([galaxy, pixel]);

    expect(screen.getByText('1738 EUR')).toBeInTheDocument();
  });

  it('removes the line the shopper deletes', async () => {
    const user = setup([galaxy, pixel]);

    await user.click(screen.getByRole('button', { name: 'Delete Galaxy S24 Ultra' }));

    expect(screen.queryByText('Galaxy S24 Ultra')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cart (1)');
  });

  it('links back to the catalogue', () => {
    setup([galaxy]);

    expect(screen.getByRole('link', { name: /continue shopping/i })).toHaveAttribute('href', '/');
  });

  it('leaves out the total and the payment when the cart is empty', () => {
    setup([]);

    expect(screen.queryByText(/total/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pay' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /continue shopping/i })).toBeInTheDocument();
  });
});
