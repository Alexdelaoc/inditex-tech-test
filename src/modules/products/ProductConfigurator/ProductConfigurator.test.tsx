import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CartProvider } from '@/modules/cart/CartProvider';
import { readCart } from '@/modules/cart/cartStorage';

import { ProductConfigurator } from './ProductConfigurator';

import type { Product } from '@/lib/api/types';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: (url: string) => push(url) }),
}));

const product: Product = {
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  basePrice: 1099,
  description: 'A phone',
  rating: 4.8,
  specs: {
    screen: '6.8"',
    resolution: '3120 x 1440',
    processor: 'Snapdragon 8 Gen 3',
    mainCamera: '200 Mpx',
    selfieCamera: '12 Mpx',
    battery: '5000 mAh',
    os: 'Android 14',
    screenRefreshRate: '120 Hz',
  },
  colorOptions: [
    { name: 'Titanium Black', hexCode: '#62605F', imageUrl: 'https://example.com/black.jpg' },
    { name: 'Titanium Violet', hexCode: '#4D4E5F', imageUrl: 'https://example.com/violet.jpg' },
  ],
  storageOptions: [
    { capacity: '256GB', price: 1099 },
    { capacity: '512GB', price: 1279 },
  ],
  similarProducts: [],
};

function setup() {
  const user = userEvent.setup();
  render(<ProductConfigurator product={product} />);

  return user;
}

describe('ProductConfigurator', () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
  });

  it('shows the name as the heading of the page', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Galaxy S24 Ultra');
  });

  it('shows the starting price until a storage is chosen', () => {
    setup();

    expect(screen.getByText('From 1099 EUR')).toBeInTheDocument();
  });

  it('shows the price of the chosen storage', async () => {
    const user = setup();

    await user.click(screen.getByRole('radio', { name: '512GB' }));

    expect(screen.getByText('1279 EUR')).toBeInTheDocument();
    expect(screen.queryByText(/from/i)).not.toBeInTheDocument();
  });

  it('keeps the add to cart button disabled until both options are chosen', async () => {
    const user = setup();
    const button = screen.getByRole('button', { name: /add/i });

    expect(button).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: '256GB' }));
    expect(button).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'Titanium Black' }));
    expect(button).toBeEnabled();
  });

  it('shows the picture of the chosen colour, starting from the first one', async () => {
    const user = setup();
    const image = () => screen.getByAltText('Galaxy S24 Ultra');

    expect(image().getAttribute('src')).toContain(
      encodeURIComponent('https://example.com/black.jpg'),
    );

    await user.click(screen.getByRole('radio', { name: 'Titanium Violet' }));

    expect(image().getAttribute('src')).toContain(
      encodeURIComponent('https://example.com/violet.jpg'),
    );
  });

  it('names the colour under the pointer, and otherwise the chosen one', async () => {
    const user = setup();
    const violet = screen.getByRole('radio', { name: 'Titanium Violet' });

    expect(screen.queryByText('Titanium Violet')).not.toBeInTheDocument();

    await user.hover(violet);
    expect(screen.getByText('Titanium Violet')).toBeInTheDocument();

    await user.unhover(violet);
    expect(screen.queryByText('Titanium Violet')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Titanium Black' }));
    await user.hover(violet);
    await user.unhover(violet);
    expect(screen.getByText('Titanium Black')).toBeInTheDocument();
  });

  it('adds the chosen configuration to the cart', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <ProductConfigurator product={product} />
      </CartProvider>,
    );

    await user.click(screen.getByRole('radio', { name: '512GB' }));
    await user.click(screen.getByRole('radio', { name: 'Titanium Violet' }));
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(readCart()).toEqual([
      expect.objectContaining({
        productId: 'SMG-S24U',
        brand: 'Samsung',
        name: 'Galaxy S24 Ultra',
        imageUrl: 'https://example.com/violet.jpg',
        color: 'Titanium Violet',
        storage: '512GB',
        price: 1279,
      }),
    ]);
  });

  it('opens the cart once the product has been added', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <ProductConfigurator product={product} />
      </CartProvider>,
    );

    await user.click(screen.getByRole('radio', { name: '512GB' }));
    await user.click(screen.getByRole('radio', { name: 'Titanium Black' }));
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(push).toHaveBeenCalledWith('/cart');
  });

  it('groups each set of options under its own label', () => {
    setup();

    expect(screen.getByRole('group', { name: /storage/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /colou?r/i })).toBeInTheDocument();
  });
});
