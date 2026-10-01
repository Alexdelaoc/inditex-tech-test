import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { aCartLine, anEntryFor } from '@/test/fixtures';

import { removeFromCart } from './actions';
import { CartProvider, useCart } from './CartProvider';

import type { CartEntry } from './types';

jest.mock('./actions', () => ({ removeFromCart: jest.fn(), addToCart: jest.fn() }));

const mockedRemove = jest.mocked(removeFromCart);

const a = anEntryFor(aCartLine({ id: 'a' }));
const b = anEntryFor(aCartLine({ id: 'b' }));
const c = anEntryFor(aCartLine({ id: 'c' }));

function Cart() {
  const { count, entries, removeLine } = useCart();

  return (
    <>
      <p>{count} in the cart</p>
      {entries.map((entry) => (
        <form key={entry.id} action={removeLine.bind(null, entry.id)}>
          <button type="submit">Remove {entry.id}</button>
        </form>
      ))}
    </>
  );
}

const pending: Array<() => void> = [];

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  pending.push(resolve);

  return { promise, resolve, reject };
}

function setup(entries: CartEntry[]) {
  const user = userEvent.setup();
  const view = render(
    <CartProvider entries={entries}>
      <Cart />
    </CartProvider>,
  );

  const serverSends = (next: CartEntry[]) =>
    view.rerender(
      <CartProvider entries={next}>
        <Cart />
      </CartProvider>,
    );

  return { user, serverSends };
}

describe('CartProvider', () => {
  beforeEach(() => {
    mockedRemove.mockReset();
  });

  afterEach(async () => {
    await act(async () => pending.splice(0).forEach((resolve) => resolve()));
  });

  it('counts the lines the server says the cart holds', () => {
    setup([a, b, c]);

    expect(screen.getByText('3 in the cart')).toBeInTheDocument();
  });

  it('follows the cart the server sends after any change', () => {
    const { serverSends } = setup([a]);

    serverSends([a, b]);

    expect(screen.getByText('2 in the cart')).toBeInTheDocument();
  });

  describe('removing a line', () => {
    it('asks the server to remove it', async () => {
      mockedRemove.mockResolvedValue();
      const { user } = setup([a, b]);

      await user.click(screen.getByRole('button', { name: 'Remove b' }));

      expect(mockedRemove).toHaveBeenCalledWith('b');
    });

    it('takes it out straight away, without waiting for the server', async () => {
      mockedRemove.mockReturnValue(deferred().promise);
      const { user } = setup([a, b, c]);

      await user.click(screen.getByRole('button', { name: 'Remove b' }));

      expect(screen.getByText('2 in the cart')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Remove b' })).not.toBeInTheDocument();
    });

    it('settles on what the server says once it answers', async () => {
      const removal = deferred();
      mockedRemove.mockReturnValue(removal.promise);
      const { user, serverSends } = setup([a, b, c]);

      await user.click(screen.getByRole('button', { name: 'Remove b' }));
      serverSends([a, c]);
      await act(async () => removal.resolve());

      expect(screen.getByText('2 in the cart')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Remove b' })).not.toBeInTheDocument();
    });

    it('puts the line back if the server still has it once the removal settles', async () => {
      const removal = deferred();
      mockedRemove.mockReturnValue(removal.promise);
      const { user } = setup([a, b]);

      await user.click(screen.getByRole('button', { name: 'Remove b' }));
      await act(async () => removal.resolve());

      expect(screen.getByText('2 in the cart')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove b' })).toBeInTheDocument();
    });

    it('puts the line back when the server could not remove it', async () => {
      const removal = deferred();
      mockedRemove.mockReturnValue(removal.promise);
      const { user } = setup([a, b]);

      await user.click(screen.getByRole('button', { name: 'Remove b' }));
      expect(screen.getByText('1 in the cart')).toBeInTheDocument();

      await act(async () => removal.reject(new Error('fetch failed')));

      expect(screen.getByText('2 in the cart')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove b' })).toBeInTheDocument();
    });
  });
});
