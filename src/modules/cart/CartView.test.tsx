import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { aCartLine, anEntryFor } from '@/test/fixtures';

import { removeFromCart } from './actions';
import { CartProvider } from './CartProvider';
import { CartView } from './CartView';

import type { CartLine } from './types';

jest.mock('./actions', () => ({ removeFromCart: jest.fn(), addToCart: jest.fn() }));

const mockedRemove = jest.mocked(removeFromCart);

const galaxy = aCartLine();
const pixel = aCartLine({
  id: 'line-2',
  productId: 'GPX-8PRO',
  name: 'Pixel 8 Pro',
  imageUrl: 'https://example.com/pixel.webp',
  color: 'Obsidian',
  storage: '128 GB',
  price: 1099,
});

let settleRemoval: () => void = () => {};

function setup(lines: CartLine[]) {
  mockedRemove.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        settleRemoval = resolve;
      }),
  );
  const user = userEvent.setup();
  render(
    <CartProvider entries={lines.map(anEntryFor)}>
      <CartView lines={lines} />
    </CartProvider>,
  );

  return user;
}

const title = () => screen.getByRole('heading', { level: 1 });
const lineItems = () => screen.queryAllByRole('listitem');
const total = () => screen.getByText('Total').parentElement;

describe('CartView', () => {
  afterEach(async () => {
    await act(async () => settleRemoval());
  });

  describe('with products', () => {
    it('counts the lines in the title', () => {
      setup([galaxy, pixel]);

      expect(title()).toHaveTextContent('Cart (2)');
    });

    it('shows the name, the chosen configuration and the price of every line', () => {
      setup([galaxy, pixel]);

      const [first, second] = lineItems().map((item) => within(item));

      expect(first!.getByText('Galaxy S24 Ultra')).toBeInTheDocument();
      expect(first!.getByText('Titanium Violet | 512 GB')).toBeInTheDocument();
      expect(first!.getByText('1349 EUR')).toBeInTheDocument();
      expect(second!.getByText('Pixel 8 Pro')).toBeInTheDocument();
      expect(second!.getByText('Obsidian | 128 GB')).toBeInTheDocument();
      expect(second!.getByText('1099 EUR')).toBeInTheDocument();
    });

    it('treats the pictures as decoration, since the text already names each line', () => {
      setup([galaxy, pixel]);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('adds up the prices of all the lines', () => {
      setup([galaxy, pixel, aCartLine({ id: 'line-3', price: 1 })]);

      expect(total()).toHaveTextContent('2449 EUR');
    });

    it('offers to pay, although payment is not available', () => {
      setup([galaxy]);

      expect(screen.getByRole('button', { name: 'Pay' })).toBeDisabled();
    });

    it('links back to the catalogue', () => {
      setup([galaxy]);

      expect(screen.getByRole('link', { name: /continue shopping/i })).toHaveAttribute('href', '/');
    });
  });

  describe('removing', () => {
    it('names each delete button after the line it removes', () => {
      setup([galaxy, pixel]);

      expect(
        screen.getByRole('button', { name: 'Delete Galaxy S24 Ultra, Titanium Violet, 512 GB' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Delete Pixel 8 Pro, Obsidian, 128 GB' }),
      ).toBeInTheDocument();
    });

    it('asks the server to remove exactly that line', async () => {
      const user = setup([galaxy, pixel]);

      await user.click(screen.getByRole('button', { name: /delete pixel/i }));

      expect(mockedRemove).toHaveBeenCalledWith('line-2');
    });

    it('takes the line out at once, along with its share of the count and the total', async () => {
      const user = setup([galaxy, pixel]);

      await user.click(screen.getByRole('button', { name: /delete galaxy/i }));

      expect(screen.queryByText('Galaxy S24 Ultra')).not.toBeInTheDocument();
      expect(screen.getByText('Pixel 8 Pro')).toBeInTheDocument();
      expect(title()).toHaveTextContent('Cart (1)');
      expect(total()).toHaveTextContent('1099 EUR');
    });

    it('removes a single unit when the same configuration was added twice', async () => {
      const user = setup([galaxy, { ...galaxy, id: 'line-1-again' }]);

      const [, second] = screen.getAllByRole('button', { name: /delete galaxy/i });
      await user.click(second!);

      expect(lineItems()).toHaveLength(1);
      expect(mockedRemove).toHaveBeenCalledWith('line-1-again');
    });

    it('falls back to the empty cart once the last line goes', async () => {
      const user = setup([galaxy]);

      await user.click(screen.getByRole('button', { name: /delete galaxy/i }));

      expect(title()).toHaveTextContent('Cart (0)');
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
      expect(screen.queryByText('Total')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Pay' })).not.toBeInTheDocument();
    });
  });

  describe('when empty', () => {
    it('says so, and leaves only the way back to the catalogue', () => {
      setup([]);

      expect(title()).toHaveTextContent('Cart (0)');
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
      expect(screen.queryByText('Total')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Pay' })).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: /continue shopping/i })).toBeInTheDocument();
    });
  });
});
