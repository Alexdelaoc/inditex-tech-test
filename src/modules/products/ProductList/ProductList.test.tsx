import { render, screen } from '@testing-library/react';

import { ProductList } from './ProductList';

import type { ProductListItem } from '@/lib/api/types';

const products: ProductListItem[] = [
  {
    id: '1',
    brand: 'Apple',
    name: 'iPhone 12',
    basePrice: 909,
    imageUrl: 'https://example.com/iphone-12.jpg',
  },
  {
    id: '2',
    brand: 'Samsung',
    name: 'Galaxy S21',
    basePrice: 859,
    imageUrl: 'https://example.com/galaxy-s21.jpg',
  },
];

describe('ProductList', () => {
  it('renders one item per product', () => {
    render(<ProductList products={products} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('shows the brand, name and base price of each product', () => {
    render(<ProductList products={products} />);

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('iPhone 12')).toBeInTheDocument();
    expect(screen.getByText('909 EUR')).toBeInTheDocument();
  });

  it('renders both entries when two products share the same id', () => {
    const [first] = products;

    if (!first) {
      throw new Error('The fixture needs at least one product');
    }

    render(<ProductList products={[first, { ...first }]} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders an empty list when there are no products', () => {
    render(<ProductList products={[]} />);

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
