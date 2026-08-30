/**
 * @jest-environment node
 */
import { getProduct, getProducts } from './client';
import { ApiError } from './errors';

import type { Product, ProductListItem } from './types';

const listItem: ProductListItem = {
  id: '1',
  brand: 'Apple',
  name: 'iPhone 12',
  basePrice: 909,
  imageUrl: 'https://example.com/iphone-12.jpg',
};

const product: Product = {
  ...listItem,
  description: 'El iPhone 12',
  rating: 4.5,
  specs: {
    screen: '6.1"',
    resolution: '2532 x 1170',
    processor: 'A14 Bionic',
    mainCamera: '12 Mpx',
    selfieCamera: '12 Mpx',
    battery: '2815 mAh',
    os: 'iOS 14',
    screenRefreshRate: '60 Hz',
  },
  colorOptions: [{ name: 'Black', hexCode: '#000000', imageUrl: 'https://example.com/black.jpg' }],
  storageOptions: [{ capacity: '128GB', price: 909 }],
  similarProducts: [],
};

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: '',
    json: async () => body,
  } as Response;
}

describe('products api client', () => {
  const fetchMock = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>();

  beforeEach(() => {
    process.env.API_BASE_URL = 'https://api.example.com';
    process.env.API_KEY = 'test-key';
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    fetchMock.mockReset();
  });

  describe('getProducts', () => {
    it('requests the products endpoint with the api key header', async () => {
      fetchMock.mockResolvedValue(jsonResponse([listItem]));

      await getProducts();

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/products',
        expect.objectContaining({ headers: { 'x-api-key': 'test-key' } }),
      );
    });

    it('returns the list of products', async () => {
      fetchMock.mockResolvedValue(jsonResponse([listItem]));

      await expect(getProducts()).resolves.toEqual([listItem]);
    });

    it('forwards search, limit and offset as query params', async () => {
      fetchMock.mockResolvedValue(jsonResponse([]));

      await getProducts({ search: 'iphone 12', limit: 20, offset: 40 });

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/products?search=iphone+12&limit=20&offset=40',
        expect.anything(),
      );
    });

    it('keeps a zero offset in the query', async () => {
      fetchMock.mockResolvedValue(jsonResponse([]));

      await getProducts({ offset: 0 });

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/products?offset=0',
        expect.anything(),
      );
    });

    it('omits an empty search term', async () => {
      fetchMock.mockResolvedValue(jsonResponse([]));

      await getProducts({ search: '' });

      expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/products', expect.anything());
    });
  });

  describe('getProduct', () => {
    it('requests a single product by id', async () => {
      fetchMock.mockResolvedValue(jsonResponse(product));

      await expect(getProduct('1')).resolves.toEqual(product);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/products/1',
        expect.anything(),
      );
    });

    it('encodes the id in the url', async () => {
      fetchMock.mockResolvedValue(jsonResponse(product));

      await getProduct('a b');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/products/a%20b',
        expect.anything(),
      );
    });
  });

  describe('error handling', () => {
    it('throws an ApiError carrying the status and the api message', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ error: 'Not Found', message: 'Product not found' }, 404),
      );

      await expect(getProduct('999')).rejects.toMatchObject({
        name: 'ApiError',
        status: 404,
        message: 'Product not found',
      });
    });

    it('falls back to the status text when the error body is not json', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      } as unknown as Response);

      await expect(getProducts()).rejects.toThrow(ApiError);
      await expect(getProducts()).rejects.toThrow('Internal Server Error');
    });

    it('fails when the api credentials are not configured', async () => {
      delete process.env.API_KEY;

      await expect(getProducts()).rejects.toThrow(/API_KEY/);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
