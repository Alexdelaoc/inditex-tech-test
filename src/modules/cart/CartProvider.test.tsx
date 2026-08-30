import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CartProvider, useCart } from './CartProvider';
import { STORAGE_KEY } from './cartStorage';

import type { NewCartLine } from './CartProvider';

const galaxy: NewCartLine = {
  productId: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  imageUrl: 'https://example.com/violet.jpg',
  color: 'Titanium Violet',
  storage: '512GB',
  price: 1279,
};

const pixel: NewCartLine = {
  productId: 'GPX-8A',
  brand: 'Google',
  name: 'Pixel 8a',
  imageUrl: 'https://example.com/pixel.jpg',
  color: 'Obsidian',
  storage: '128GB',
  price: 459,
};

function Consumer() {
  const { lines, count, total, addLine, removeLine } = useCart();

  return (
    <div>
      <p>
        {count} lines, {total} eur
      </p>
      <button type="button" onClick={() => addLine(galaxy)}>
        add galaxy
      </button>
      <button type="button" onClick={() => addLine(pixel)}>
        add pixel
      </button>
      {lines.map((line) => (
        <button key={line.id} type="button" onClick={() => removeLine(line.id)}>
          remove {line.name}
        </button>
      ))}
    </div>
  );
}

function setup() {
  const user = userEvent.setup();
  render(
    <CartProvider>
      <Consumer />
    </CartProvider>,
  );

  return user;
}

describe('CartProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with an empty cart', () => {
    setup();

    expect(screen.getByText('0 lines, 0 eur')).toBeInTheDocument();
  });

  it('counts the lines and adds up their prices', async () => {
    const user = setup();

    await user.click(screen.getByRole('button', { name: 'add galaxy' }));
    await user.click(screen.getByRole('button', { name: 'add pixel' }));

    expect(screen.getByText('2 lines, 1738 eur')).toBeInTheDocument();
  });

  it('keeps a repeated configuration as its own line', async () => {
    const user = setup();

    await user.click(screen.getByRole('button', { name: 'add galaxy' }));
    await user.click(screen.getByRole('button', { name: 'add galaxy' }));

    expect(screen.getByText('2 lines, 2558 eur')).toBeInTheDocument();
  });

  it('removes one line without touching its twin', async () => {
    const user = setup();

    await user.click(screen.getByRole('button', { name: 'add galaxy' }));
    await user.click(screen.getByRole('button', { name: 'add galaxy' }));
    await user.click(screen.getAllByRole('button', { name: /remove/i })[0]!);

    expect(screen.getByText('1 lines, 1279 eur')).toBeInTheDocument();
  });

  it('restores what was left in the browser', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...galaxy, id: 'kept' }]));

    setup();

    expect(screen.getByText('1 lines, 1279 eur')).toBeInTheDocument();
  });

  it('remembers the cart between visits', async () => {
    const user = setup();

    await user.click(screen.getByRole('button', { name: 'add galaxy' }));

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toHaveLength(1);
  });
});
