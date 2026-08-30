import { readCart, STORAGE_KEY, writeCart } from './cartStorage';

import type { CartLine } from './types';

const line: CartLine = {
  id: 'line-1',
  productId: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  imageUrl: 'https://example.com/violet.jpg',
  color: 'Titanium Violet',
  storage: '512GB',
  price: 1279,
};

describe('cart storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty', () => {
    expect(readCart()).toEqual([]);
  });

  it('reads back what it wrote', () => {
    writeCart([line]);

    expect(readCart()).toEqual([line]);
  });

  it('ignores a stored value that is not valid json', () => {
    localStorage.setItem(STORAGE_KEY, 'not json');

    expect(readCart()).toEqual([]);
  });

  it('ignores a stored value that is not a list', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ productId: 'SMG-S24U' }));

    expect(readCart()).toEqual([]);
  });

  it('drops entries that do not look like cart lines', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([line, { productId: 'SMG-S24U' }, null]));

    expect(readCart()).toEqual([line]);
  });

  it('survives a storage that refuses to write', () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    expect(() => writeCart([line])).not.toThrow();

    setItem.mockRestore();
  });
});
