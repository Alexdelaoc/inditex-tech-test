import { render, screen } from '@testing-library/react';

import { getProduct } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { aProduct } from '@/test/fixtures';

import ProductPage, { generateMetadata } from './page';

jest.mock('@/lib/api/client', () => ({
  getProduct: jest.fn(),
}));

jest.mock('@/modules/cart/actions', () => ({ addToCart: jest.fn(), removeFromCart: jest.fn() }));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

const mockedGetProduct = jest.mocked(getProduct);

function paramsFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

async function renderPage(id: string) {
  render(await ProductPage(paramsFor(id)));
}

describe('product page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when the product exists', () => {
    beforeEach(() => {
      mockedGetProduct.mockResolvedValue(aProduct());
    });

    it('asks the api for the product in the url', async () => {
      await renderPage('SMG-S24U');

      expect(mockedGetProduct).toHaveBeenCalledWith('SMG-S24U');
    });

    it('shows the product, its specifications and the similar products', async () => {
      await renderPage('SMG-S24U');

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Galaxy S24 Ultra');
      expect(screen.getByRole('heading', { name: 'Specifications' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Similar items' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /iphone 15 pro max/i })).toBeInTheDocument();
    });

    it('offers a way back to the catalogue', async () => {
      await renderPage('SMG-S24U');

      expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/');
    });

    it('still works for a product without similar items', async () => {
      mockedGetProduct.mockResolvedValue(aProduct({ similarProducts: [] }));

      await renderPage('SMG-S24U');

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Similar items' })).not.toBeInTheDocument();
    });
  });

  describe('when the api does not know the product', () => {
    it('renders the not found page', async () => {
      mockedGetProduct.mockRejectedValue(new ApiError('Product not found', 404));

      await expect(ProductPage(paramsFor('NOPE'))).rejects.toThrow('NEXT_NOT_FOUND');
    });
  });

  describe('when the api fails', () => {
    it.each([
      ['rejects the api key', new ApiError('Invalid API key', 401)],
      ['breaks', new ApiError('Internal Server Error', 500)],
      ['is unreachable', new TypeError('fetch failed')],
    ])('lets the error boundary handle it when the api %s', async (_, failure) => {
      mockedGetProduct.mockRejectedValue(failure);

      await expect(ProductPage(paramsFor('SMG-S24U'))).rejects.toBe(failure);
    });
  });
});

describe('product page metadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('titles and describes the page after the product', async () => {
    mockedGetProduct.mockResolvedValue(aProduct());

    await expect(generateMetadata(paramsFor('SMG-S24U'))).resolves.toEqual({
      title: 'Galaxy S24 Ultra',
      description: 'The Galaxy S24 Ultra with a 200 Mpx camera and an S Pen built in.',
    });
  });

  it('renders the not found page for an unknown product', async () => {
    mockedGetProduct.mockRejectedValue(new ApiError('Product not found', 404));

    await expect(generateMetadata(paramsFor('NOPE'))).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('lets any other failure through', async () => {
    const failure = new ApiError('Internal Server Error', 500);
    mockedGetProduct.mockRejectedValue(failure);

    await expect(generateMetadata(paramsFor('SMG-S24U'))).rejects.toBe(failure);
  });
});
