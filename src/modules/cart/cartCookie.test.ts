/**
 * @jest-environment node
 */
import { cartCookieOptions, decodeCart, encodeCart, exceedsCookieLimit } from './cartCookie';

import type { CartEntry } from './types';

const galaxy: CartEntry = {
  id: 'k3Jx9_aQ',
  productId: 'SMG-S24U',
  color: 'Titanium Violet',
  storage: '512 GB',
};
const pixel: CartEntry = {
  id: 'Zp0-7cWm',
  productId: 'GPX-8PRO',
  color: 'Obsidian',
  storage: '128 GB',
};

function encodedTuples(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

describe('cart cookie', () => {
  describe('reading', () => {
    it('reads back exactly what was written, in the same order', () => {
      expect(decodeCart(encodeCart([galaxy, pixel]))).toEqual([galaxy, pixel]);
    });

    it.each([
      ['no cookie at all', undefined],
      ['an empty cookie', ''],
      ['something that is not base64', '%%%not-base64%%%'],
      ['base64 that is not json', Buffer.from('not json').toString('base64url')],
      ['json that is not a list', encodedTuples({ id: 'a' })],
      ['a list of nothing useful', encodedTuples([null, 42, 'x', {}])],
    ])('treats %s as an empty cart', (_, raw) => {
      expect(decodeCart(raw)).toEqual([]);
    });

    it('keeps the valid lines of a partly corrupted cookie', () => {
      const raw = encodedTuples([
        ['k3Jx9_aQ', 'SMG-S24U', 'Titanium Violet', '512 GB'],
        ['short', 'tuple'],
        ['a', 'b', 'c', 7],
        ['', 'SMG-S24U', 'Titanium Violet', '512 GB'],
        ['too', 'many', 'fields', 'in', 'here'],
        ['Zp0-7cWm', 'GPX-8PRO', 'Obsidian', '128 GB'],
      ]);

      expect(decodeCart(raw)).toEqual([galaxy, pixel]);
    });

    it('keeps only the first of two lines that claim the same id', () => {
      const raw = encodedTuples([
        ['k3Jx9_aQ', 'SMG-S24U', 'Titanium Violet', '512 GB'],
        ['k3Jx9_aQ', 'GPX-8PRO', 'Obsidian', '128 GB'],
      ]);

      expect(decodeCart(raw)).toEqual([galaxy]);
    });
  });

  describe('writing', () => {
    it('stays out of the way of url encoding, which would otherwise inflate it', () => {
      const value = encodeCart([galaxy, { ...pixel, color: 'Azul "Pacífico" / 2024, édition' }]);

      expect(encodeURIComponent(value)).toBe(value);
    });

    it('fits a realistically full cart', () => {
      const lines = Array.from({ length: 40 }, (_, index) => ({
        ...galaxy,
        id: `line${String(index).padStart(4, '0')}`,
      }));

      expect(exceedsCookieLimit(encodeCart(lines))).toBe(false);
    });

    it('flags a cart that browsers would silently drop', () => {
      const lines = Array.from({ length: 200 }, (_, index) => ({
        ...galaxy,
        id: `line${String(index).padStart(4, '0')}`,
      }));

      expect(exceedsCookieLimit(encodeCart(lines))).toBe(true);
    });

    it('never lets an accepted cookie go past the 4096 bytes browsers guarantee', () => {
      const lines: CartEntry[] = [];
      let value = encodeCart(lines);

      while (!exceedsCookieLimit(encodeCart([...lines, { ...galaxy, id: `l${lines.length}` }]))) {
        lines.push({ ...galaxy, id: `l${lines.length}` });
        value = encodeCart(lines);
      }

      const options = cartCookieOptions(true);
      const header = [
        `cart=${encodeURIComponent(value)}`,
        `Path=${options.path}`,
        `Max-Age=${options.maxAge}`,
        'Secure',
        'HttpOnly',
        `SameSite=${options.sameSite}`,
      ].join('; ');

      expect(new TextEncoder().encode(header).length).toBeLessThanOrEqual(4096);
    });
  });

  describe('options', () => {
    it('keeps the cookie away from scripts and cross-site requests, for a month', () => {
      expect(cartCookieOptions(false)).toEqual({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        secure: false,
      });
    });

    it('marks the cookie secure only when the request came over https', () => {
      expect(cartCookieOptions(true).secure).toBe(true);
      expect(cartCookieOptions(false).secure).toBe(false);
    });
  });
});
