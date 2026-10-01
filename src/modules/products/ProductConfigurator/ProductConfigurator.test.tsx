import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { addToCart } from '@/modules/cart/actions';
import { readChoice } from '@/modules/products/configuration';
import { aProduct } from '@/test/fixtures';

import { ProductConfigurator } from './ProductConfigurator';

import type { Product } from '@/lib/api/types';
import type { AddToCartState } from '@/modules/cart/actions';

jest.mock('@/modules/cart/actions', () => ({ addToCart: jest.fn(), removeFromCart: jest.fn() }));

const mockedAddToCart = jest.mocked(addToCart);

let answer: (state: AddToCartState) => void = () => {};

function setup(product: Product = aProduct()) {
  mockedAddToCart.mockImplementation(
    () =>
      new Promise<AddToCartState>((resolve) => {
        answer = resolve;
      }),
  );
  const user = userEvent.setup();
  render(<ProductConfigurator product={product} />);

  return user;
}

function sentChoice() {
  const [productId, , formData] = mockedAddToCart.mock.calls.at(-1)!;

  return { productId, ...readChoice(formData) };
}

const addButton = () => screen.getByRole('button', { name: 'Add' });
const storageGroup = () => screen.getByRole('group', { name: /storage/i });
const colourGroup = () => screen.getByRole('group', { name: /colou?r/i });
const shownPicture = () => screen.getByRole('img');

describe('ProductConfigurator', () => {
  beforeEach(() => {
    mockedAddToCart.mockReset();
  });

  afterEach(async () => {
    await act(async () => answer({ error: null }));
  });

  describe('presenting the product', () => {
    it('uses the name as the heading of the page', () => {
      setup();

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Galaxy S24 Ultra');
    });

    it('shows the starting price until a storage is chosen', () => {
      setup();

      expect(screen.getByText('From 1229 EUR')).toBeInTheDocument();
    });

    it('follows the price of whichever storage is chosen', async () => {
      const user = setup();

      await user.click(within(storageGroup()).getByRole('radio', { name: '1 TB' }));
      expect(screen.getByText('1589 EUR')).toBeInTheDocument();

      await user.click(within(storageGroup()).getByRole('radio', { name: '512 GB' }));
      expect(screen.getByText('1349 EUR')).toBeInTheDocument();
      expect(screen.queryByText(/from/i)).not.toBeInTheDocument();
    });

    it('pictures the first colour until another one is chosen', async () => {
      const user = setup();

      expect(shownPicture()).toHaveAttribute('alt', 'Galaxy S24 Ultra');
      expect(shownPicture().getAttribute('src')).toContain(
        encodeURIComponent('https://example.com/black.webp'),
      );

      await user.click(within(colourGroup()).getByRole('radio', { name: 'Titanium Yellow' }));

      expect(shownPicture().getAttribute('src')).toContain(
        encodeURIComponent('https://example.com/yellow.webp'),
      );
    });

    it('describes only the picture on show to assistive technology', () => {
      setup();

      expect(screen.getAllByRole('img')).toHaveLength(1);
    });
  });

  describe('choosing a configuration', () => {
    it('offers every storage and colour as a named option, grouped under its own label', () => {
      setup();

      expect(
        within(storageGroup())
          .getAllByRole('radio')
          .map((radio) => radio.getAttribute('value')),
      ).toEqual(['256 GB', '512 GB', '1 TB']);
      expect(
        within(colourGroup())
          .getAllByRole('radio')
          .map((radio) => radio.getAttribute('value')),
      ).toEqual(['Titanium Black', 'Titanium Violet', 'Titanium Yellow']);
    });

    it('names each colour once for screen readers, however it is shown on screen', () => {
      setup();

      for (const name of ['Titanium Black', 'Titanium Violet', 'Titanium Yellow']) {
        expect(screen.getByRole('radio', { name })).toBeInTheDocument();
        expect(screen.queryByRole('radio', { name: `${name} ${name}` })).not.toBeInTheDocument();
      }
    });

    it('can be done entirely with the keyboard', async () => {
      const user = setup();

      await user.tab();
      await user.keyboard(' ');
      await user.keyboard('{ArrowRight}');
      await user.tab();
      await user.keyboard(' ');

      expect(within(storageGroup()).getByRole('radio', { name: '512 GB' })).toBeChecked();
      expect(within(colourGroup()).getByRole('radio', { name: 'Titanium Black' })).toBeChecked();
      expect(addButton()).toBeEnabled();
    });

    it('keeps the add button disabled until both a storage and a colour are chosen', async () => {
      const user = setup();

      expect(addButton()).toBeDisabled();

      await user.click(within(colourGroup()).getByRole('radio', { name: 'Titanium Violet' }));
      expect(addButton()).toBeDisabled();

      await user.click(within(storageGroup()).getByRole('radio', { name: '256 GB' }));
      expect(addButton()).toBeEnabled();
    });
  });

  describe('adding to the cart', () => {
    it('sends exactly the configuration on screen, for this product', async () => {
      const user = setup();

      await user.click(within(storageGroup()).getByRole('radio', { name: '256 GB' }));
      await user.click(within(colourGroup()).getByRole('radio', { name: 'Titanium Black' }));
      await user.click(within(storageGroup()).getByRole('radio', { name: '1 TB' }));
      await user.click(within(colourGroup()).getByRole('radio', { name: 'Titanium Violet' }));
      await user.click(addButton());

      expect(mockedAddToCart).toHaveBeenCalledTimes(1);
      expect(sentChoice()).toEqual({
        productId: 'SMG-S24U',
        storage: '1 TB',
        color: 'Titanium Violet',
      });
    });

    it('cannot be sent twice while the cart is still answering', async () => {
      const user = setup();

      await user.click(within(storageGroup()).getByRole('radio', { name: '256 GB' }));
      await user.click(within(colourGroup()).getByRole('radio', { name: 'Titanium Black' }));
      await user.click(addButton());

      expect(addButton()).toBeDisabled();

      await user.click(addButton());
      expect(mockedAddToCart).toHaveBeenCalledTimes(1);
    });

    it('explains, out loud, why the cart turned the product down', async () => {
      const user = setup();

      await user.click(within(storageGroup()).getByRole('radio', { name: '256 GB' }));
      await user.click(within(colourGroup()).getByRole('radio', { name: 'Titanium Black' }));
      await user.click(addButton());
      await act(async () =>
        answer({ error: 'Your cart is full. Remove something before adding more.' }),
      );

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Your cart is full. Remove something before adding more.',
      );
      expect(addButton()).toBeEnabled();
    });

    it('keeps the choice on screen after being turned down, so trying again sends it again', async () => {
      const user = setup();

      await user.click(within(storageGroup()).getByRole('radio', { name: '512 GB' }));
      await user.click(within(colourGroup()).getByRole('radio', { name: 'Titanium Yellow' }));
      await user.click(addButton());
      await act(async () => answer({ error: 'We could not add it right now. Please try again.' }));

      expect(within(storageGroup()).getByRole('radio', { name: '512 GB' })).toBeChecked();
      expect(within(colourGroup()).getByRole('radio', { name: 'Titanium Yellow' })).toBeChecked();

      await user.click(addButton());

      expect(mockedAddToCart).toHaveBeenCalledTimes(2);
      expect(sentChoice()).toEqual({
        productId: 'SMG-S24U',
        storage: '512 GB',
        color: 'Titanium Yellow',
      });
    });

    it('says nothing until there is something to say', () => {
      setup();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('sends option names that need escaping untouched', async () => {
      const user = setup(
        aProduct({
          colorOptions: [
            {
              name: 'Azul "Pacífico" / 2024',
              hexCode: '#1C3D5A',
              imageUrl: 'https://example.com/a.webp',
            },
          ],
          storageOptions: [{ capacity: '128 GB + 1 TB microSD', price: 999 }],
        }),
      );

      await user.click(screen.getByRole('radio', { name: '128 GB + 1 TB microSD' }));
      await user.click(screen.getByRole('radio', { name: 'Azul "Pacífico" / 2024' }));
      await user.click(addButton());

      expect(sentChoice()).toEqual(
        expect.objectContaining({
          storage: '128 GB + 1 TB microSD',
          color: 'Azul "Pacífico" / 2024',
        }),
      );
    });
  });

  describe('with incomplete product data', () => {
    it('never offers to add a product that has no storage options', async () => {
      const user = setup(aProduct({ storageOptions: [] }));

      await user.click(within(colourGroup()).getByRole('radio', { name: 'Titanium Black' }));

      expect(within(storageGroup()).queryAllByRole('radio')).toHaveLength(0);
      expect(screen.getByText('From 1229 EUR')).toBeInTheDocument();
      expect(addButton()).toBeDisabled();
    });

    it('never offers to add a product that has no colours, and shows no picture', async () => {
      const user = setup(aProduct({ colorOptions: [] }));

      await user.click(within(storageGroup()).getByRole('radio', { name: '256 GB' }));

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(addButton()).toBeDisabled();
    });

    it('works with a single colour and a single storage', async () => {
      const user = setup(
        aProduct({
          colorOptions: [
            { name: 'Midnight', hexCode: '#191970', imageUrl: 'https://example.com/m.webp' },
          ],
          storageOptions: [{ capacity: '128 GB', price: 699 }],
        }),
      );

      await user.click(screen.getByRole('radio', { name: '128 GB' }));
      await user.click(screen.getByRole('radio', { name: 'Midnight' }));
      await user.click(addButton());

      expect(sentChoice()).toEqual({ productId: 'SMG-S24U', storage: '128 GB', color: 'Midnight' });
    });
  });
});
