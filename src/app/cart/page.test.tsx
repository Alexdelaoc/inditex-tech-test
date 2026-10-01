import { render, screen } from '@testing-library/react';

import { ApiError } from '@/lib/api/errors';
import { readCartEntries, resolveCartLines } from '@/modules/cart/cart';
import { CartProvider } from '@/modules/cart/CartProvider';
import { aCartLine, anEntryFor } from '@/test/fixtures';

import CartPage from './page';

jest.mock('@/modules/cart/cart', () => ({
  readCartEntries: jest.fn(),
  resolveCartLines: jest.fn(),
}));
jest.mock('@/modules/cart/actions', () => ({ removeFromCart: jest.fn(), addToCart: jest.fn() }));

const mockedRead = jest.mocked(readCartEntries);
const mockedResolve = jest.mocked(resolveCartLines);

describe('cart page', () => {
  it('shows the lines in the cookie, completed with the catalogue', async () => {
    const line = aCartLine();
    mockedRead.mockResolvedValue([anEntryFor(line)]);
    mockedResolve.mockResolvedValue([line]);

    render(<CartProvider entries={[anEntryFor(line)]}>{await CartPage()}</CartProvider>);

    expect(mockedResolve).toHaveBeenCalledWith([anEntryFor(line)]);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cart (1)');
    expect(screen.getByText('Galaxy S24 Ultra')).toBeInTheDocument();
  });

  it('lets the error boundary handle a catalogue that cannot be reached', async () => {
    const failure = new ApiError('Internal Server Error', 500);
    mockedRead.mockResolvedValue([anEntryFor(aCartLine())]);
    mockedResolve.mockRejectedValue(failure);

    await expect(CartPage()).rejects.toBe(failure);
  });
});
