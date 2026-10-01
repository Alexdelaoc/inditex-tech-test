/**
 * @jest-environment node
 */
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getProduct } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { aCookieJar } from '@/test/cookieJar';
import { CHOICE_FIELDS } from '@/modules/products/configuration';
import { aProduct } from '@/test/fixtures';

import { addToCart, removeFromCart } from './actions';
import { CART_COOKIE, decodeCart, encodeCart } from './cartCookie';

import type { CartEntry } from './types';
import type { CookieJar } from '@/test/cookieJar';

jest.mock('next/headers', () => ({ cookies: jest.fn(), headers: jest.fn() }));
jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
jest.mock('@/lib/api/client', () => ({ getProduct: jest.fn() }));

const mockedCookies = jest.mocked(cookies);
const mockedHeaders = jest.mocked(headers);
const mockedRedirect = jest.mocked(redirect);
const mockedGetProduct = jest.mocked(getProduct);

const NOT_AVAILABLE = { error: 'This configuration is not available.' };
const TRY_AGAIN = { error: 'We could not add it right now. Please try again.' };
const CART_FULL = { error: 'Your cart is full. Remove something before adding more.' };

let jar: CookieJar;

function givenCart(entries: CartEntry[] | string) {
  jar = aCookieJar(
    typeof entries === 'string'
      ? { [CART_COOKIE]: entries }
      : entries.length > 0
        ? { [CART_COOKIE]: encodeCart(entries) }
        : {},
  );
  mockedCookies.mockResolvedValue(jar as unknown as Awaited<ReturnType<typeof cookies>>);
}

function givenProtocol(protocol: 'http' | 'https') {
  mockedHeaders.mockResolvedValue(
    new Headers({ 'x-forwarded-proto': protocol }) as unknown as Awaited<
      ReturnType<typeof headers>
    >,
  );
}

function storedCart() {
  return decodeCart(jar.writes.at(-1)?.value);
}

function choice({ color, storage }: { color: string; storage: string }) {
  const formData = new FormData();
  formData.append(CHOICE_FIELDS.color, color);
  formData.append(CHOICE_FIELDS.storage, storage);

  return formData;
}

function add(fields: { color: string; storage: string }, productId = 'SMG-S24U') {
  return addToCart(productId, { error: null }, choice(fields));
}

const violet512 = { color: 'Titanium Violet', storage: '512 GB' };

function existing(id: string, overrides: Partial<CartEntry> = {}): CartEntry {
  return { id, productId: 'SMG-S24U', ...violet512, ...overrides };
}

describe('adding to the cart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    givenCart([]);
    givenProtocol('https');
    mockedGetProduct.mockResolvedValue(aProduct());
  });

  describe('a valid configuration', () => {
    it('is stored and the shopper is taken to the cart', async () => {
      await expect(add(violet512)).rejects.toThrow('NEXT_REDIRECT');

      expect(storedCart()).toEqual([
        { id: expect.stringMatching(/^[\w-]{8}$/), productId: 'SMG-S24U', ...violet512 },
      ]);
      expect(mockedRedirect).toHaveBeenCalledWith('/cart');
    });

    it('is checked against the catalogue, not taken on trust', async () => {
      await expect(add(violet512)).rejects.toThrow('NEXT_REDIRECT');

      expect(mockedGetProduct).toHaveBeenCalledWith('SMG-S24U');
    });

    it('goes after whatever was already in the cart', async () => {
      givenCart([
        existing('first', { productId: 'GPX-8PRO', color: 'Obsidian', storage: '128 GB' }),
      ]);

      await expect(add(violet512)).rejects.toThrow('NEXT_REDIRECT');

      expect(storedCart().map((line) => line.productId)).toEqual(['GPX-8PRO', 'SMG-S24U']);
    });

    it('becomes a separate line each time it is added', async () => {
      await expect(add(violet512)).rejects.toThrow('NEXT_REDIRECT');
      givenCart(storedCart());
      await expect(add(violet512)).rejects.toThrow('NEXT_REDIRECT');

      const [first, second] = storedCart();

      expect(storedCart()).toHaveLength(2);
      expect(first!.id).not.toBe(second!.id);
    });

    it('starts a fresh cart over one that can no longer be read', async () => {
      givenCart('this is not a cart');

      await expect(add(violet512)).rejects.toThrow('NEXT_REDIRECT');

      expect(storedCart()).toEqual([expect.objectContaining(violet512)]);
    });
  });

  describe('the cookie it writes', () => {
    it('cannot be read by scripts nor sent by other sites, and lasts a month', async () => {
      await expect(add(violet512)).rejects.toThrow('NEXT_REDIRECT');

      expect(jar.writes.at(-1)?.options).toEqual(
        expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/', maxAge: 2592000 }),
      );
    });

    it('is secure over https', async () => {
      await expect(add(violet512)).rejects.toThrow('NEXT_REDIRECT');

      expect(jar.writes.at(-1)?.options.secure).toBe(true);
    });

    it('still works over plain http, where a secure cookie would be dropped', async () => {
      givenProtocol('http');

      await expect(add(violet512)).rejects.toThrow('NEXT_REDIRECT');

      expect(jar.writes.at(-1)?.options.secure).toBe(false);
    });
  });

  describe('a submission that cannot be honoured', () => {
    it('is turned down when the product does not offer it, and the cart is left alone', async () => {
      givenCart([existing('first')]);

      await expect(add({ color: 'Titanium Blue', storage: '512 GB' })).resolves.toEqual(
        NOT_AVAILABLE,
      );

      expect(jar.writes).toHaveLength(0);
      expect(mockedRedirect).not.toHaveBeenCalled();
    });

    it('is turned down for a product the catalogue does not know', async () => {
      mockedGetProduct.mockRejectedValue(new ApiError('Product not found', 404));

      await expect(add(violet512, 'NOPE')).resolves.toEqual(NOT_AVAILABLE);
      expect(jar.writes).toHaveLength(0);
    });

    it.each([
      ['rejects the api key', new ApiError('Invalid API key', 401)],
      ['breaks', new ApiError('Internal Server Error', 500)],
      ['is unreachable', new TypeError('fetch failed')],
    ])('asks to try again when the catalogue %s, without touching the cart', async (_, failure) => {
      givenCart([existing('first')]);
      mockedGetProduct.mockRejectedValue(failure);

      await expect(add(violet512)).resolves.toEqual(TRY_AGAIN);
      expect(jar.writes).toHaveLength(0);
      expect(mockedRedirect).not.toHaveBeenCalled();
    });

    it('is turned down once the cart is as big as a cookie can safely be', async () => {
      const full = Array.from({ length: 80 }, (_, index) => existing(`line${index}`));
      givenCart(full);

      await expect(add(violet512)).resolves.toEqual(CART_FULL);
      expect(jar.writes).toHaveLength(0);
    });
  });
});

describe('removing from the cart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    givenProtocol('https');
  });

  it('removes only the line asked for, keeping the order of the rest', async () => {
    givenCart([existing('a'), existing('b'), existing('c')]);

    await removeFromCart('b');

    expect(storedCart().map((line) => line.id)).toEqual(['a', 'c']);
  });

  it('removes one unit when the same configuration was added twice', async () => {
    givenCart([existing('a'), existing('a-again')]);

    await removeFromCart('a-again');

    expect(storedCart()).toEqual([existing('a')]);
  });

  it('leaves the cart as it was for a line it does not have', async () => {
    givenCart([existing('a'), existing('b')]);

    await removeFromCart('not-in-the-cart');

    expect(storedCart()).toEqual([existing('a'), existing('b')]);
  });

  it('ends with an empty cart, instead of failing, when the cookie cannot be read', async () => {
    givenCart('this is not a cart');

    await expect(removeFromCart('a')).resolves.toBeUndefined();
    expect(storedCart()).toEqual([]);
  });

  it('writes the cookie with the same safe options as when adding', async () => {
    givenCart([existing('a')]);

    await removeFromCart('a');

    expect(jar.writes.at(-1)?.options).toEqual(
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', secure: true }),
    );
  });
});
