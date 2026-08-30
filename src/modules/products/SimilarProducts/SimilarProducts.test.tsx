import { render, screen } from '@testing-library/react';

import { SimilarProducts } from './SimilarProducts';

import type { ProductListItem } from '@/lib/api/types';

const products: ProductListItem[] = [
  {
    id: '1',
    brand: 'Apple',
    name: 'iPhone 12',
    basePrice: 909,
    imageUrl: 'https://example.com/iphone-12.jpg',
  },
];

describe('SimilarProducts', () => {
  it('renders a card per product under its own heading', () => {
    render(<SimilarProducts products={products} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Similar items');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('renders nothing when the api returns no similar products', () => {
    const { container } = render(<SimilarProducts products={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
