/**
 * @jest-environment node
 */
import { cookies } from 'next/headers';

import { getProduct } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { aCookieJar } from '@/test/cookieJar';
import { aProduct } from '@/test/fixtures';

import { readCartEntries, resolveCartLines } from './cart';
import { CART_COOKIE, encodeCart } from './cartCookie';

import type { CartEntry } from './types';
import type { Product } from '@/lib/api/types';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/lib/api/client', () => ({ getProduct: jest.fn() }));

const mockedCookies = jest.mocked(cookies);
const mockedGetProduct = jest.mocked(getProduct);

const galaxy = aProduct();
const pixel = aProduct({
  id: 'GPX-8PRO',
  name: 'Pixel 8 Pro',
  colorOptions: [
    { name: 'Obsidian', hexCode: '#000', imageUrl: 'https://example.com/obsidian.webp' },
  ],
  storageOptions: [{ capacity: '128 GB', price: 1099 }],
});

function apiWith(...products: Product[]) {
  mockedGetProduct.mockImplementation(async (id) => {
    const product = products.find((candidate) => candidate.id === id);

    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    return product;
  });
}

function entry(overrides: Partial<CartEntry> = {}): CartEntry {
  return {
    id: 'a',
    productId: 'SMG-S24U',
    color: 'Titanium Violet',
    storage: '512 GB',
    ...overrides,
  };
}

describe('reading the cart', () => {
  it('reads the lines stored in the cart cookie', async () => {
    const stored = [entry({ id: 'a' }), entry({ id: 'b', productId: 'GPX-8PRO' })];
    mockedCookies.mockResolvedValue(
      aCookieJar({ [CART_COOKIE]: encodeCart(stored) }) as unknown as Awaited<
        ReturnType<typeof cookies>
      >,
    );

    await expect(readCartEntries()).resolves.toEqual(stored);
  });

  it('starts empty for a shopper who has never added anything', async () => {
    mockedCookies.mockResolvedValue(aCookieJar() as unknown as Awaited<ReturnType<typeof cookies>>);

    await expect(readCartEntries()).resolves.toEqual([]);
  });
});

describe('resolving the cart against the catalogue', () => {
  beforeEach(() => {
    mockedGetProduct.mockReset();
  });

  it('completes each line with the current name, the picture of its colour and the price of its storage', async () => {
    apiWith(galaxy, pixel);

    await expect(
      resolveCartLines([
        entry({ id: 'a', color: 'Titanium Yellow', storage: '1 TB' }),
        entry({ id: 'b', productId: 'GPX-8PRO', color: 'Obsidian', storage: '128 GB' }),
      ]),
    ).resolves.toEqual([
      {
        id: 'a',
        productId: 'SMG-S24U',
        color: 'Titanium Yellow',
        storage: '1 TB',
        name: 'Galaxy S24 Ultra',
        imageUrl: 'https://example.com/yellow.webp',
        price: 1589,
      },
      {
        id: 'b',
        productId: 'GPX-8PRO',
        color: 'Obsidian',
        storage: '128 GB',
        name: 'Pixel 8 Pro',
        imageUrl: 'https://example.com/obsidian.webp',
        price: 1099,
      },
    ]);
  });

  it('asks the catalogue once per product, however many lines share it', async () => {
    apiWith(galaxy, pixel);

    await resolveCartLines([
      entry({ id: 'a' }),
      entry({ id: 'b', productId: 'GPX-8PRO', color: 'Obsidian', storage: '128 GB' }),
      entry({ id: 'c' }),
      entry({ id: 'd', storage: '256 GB' }),
    ]);

    expect(mockedGetProduct).toHaveBeenCalledTimes(2);
  });

  it('does not bother the catalogue for an empty cart', async () => {
    await expect(resolveCartLines([])).resolves.toEqual([]);
    expect(mockedGetProduct).not.toHaveBeenCalled();
  });

  it('leaves out lines whose product has left the catalogue, and keeps the rest', async () => {
    apiWith(pixel);

    const lines = await resolveCartLines([
      entry({ id: 'a' }),
      entry({ id: 'b', productId: 'GPX-8PRO', color: 'Obsidian', storage: '128 GB' }),
    ]);

    expect(lines.map((line) => line.id)).toEqual(['b']);
  });

  it('leaves out lines whose configuration the product no longer offers', async () => {
    apiWith(galaxy);

    const lines = await resolveCartLines([
      entry({ id: 'gone', color: 'Titanium Blue' }),
      entry({ id: 'still-here' }),
    ]);

    expect(lines.map((line) => line.id)).toEqual(['still-here']);
  });

  it.each([
    ['rejects the api key', new ApiError('Invalid API key', 401)],
    ['breaks', new ApiError('Internal Server Error', 500)],
    ['is unreachable', new TypeError('fetch failed')],
  ])(
    'fails loudly when the catalogue %s, instead of showing a cart with lines missing',
    async (_, failure) => {
      mockedGetProduct.mockRejectedValue(failure);

      await expect(resolveCartLines([entry()])).rejects.toBe(failure);
    },
  );
});
