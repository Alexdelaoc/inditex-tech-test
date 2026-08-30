import { render, screen } from '@testing-library/react';

import { ProductCard } from './ProductCard';

import type { ProductListItem } from '@/lib/api/types';

const product: ProductListItem = {
  id: 'APL-IP15PM',
  brand: 'Apple',
  name: 'iPhone 15 Pro Max',
  basePrice: 1319,
  imageUrl: 'https://example.com/iphone-15-pro-max.jpg',
};

describe('ProductCard', () => {
  it('links to the detail of the product', () => {
    render(<ProductCard product={product} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/APL-IP15PM');
  });

  it('shows the brand, the name and the base price', () => {
    render(<ProductCard product={product} />);

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('iPhone 15 Pro Max')).toBeInTheDocument();
    expect(screen.getByText('1319 EUR')).toBeInTheDocument();
  });

  it('names the link after the product', () => {
    render(<ProductCard product={product} />);

    expect(screen.getByRole('link', { name: /apple iphone 15 pro max/i })).toBeInTheDocument();
  });

  it('leaves the picture out of the accessibility tree, since the link already names it', () => {
    const { container } = render(<ProductCard product={product} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  it('escapes ids that would break the url', () => {
    render(<ProductCard product={{ ...product, id: 'a b' }} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/a%20b');
  });
});
