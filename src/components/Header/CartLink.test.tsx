import { render, screen } from '@testing-library/react';

import { CartLink } from './CartLink';

describe('CartLink', () => {
  it('leads to the cart', () => {
    render(<CartLink count={0} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/cart');
  });

  it.each([
    [0, 'Cart, 0 products'],
    [1, 'Cart, 1 product'],
    [2, 'Cart, 2 products'],
    [137, 'Cart, 137 products'],
  ])('announces a cart with %i products as "%s"', (count, name) => {
    render(<CartLink count={count} />);

    expect(screen.getByRole('link', { name })).toBeInTheDocument();
  });

  it('shows the empty cart icon and a zero when there is nothing in it', () => {
    const { container } = render(<CartLink count={0} />);

    expect(container.querySelector('[data-icon="cart"]')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('0');
  });

  it('shows the filled cart icon and the count when there are products', () => {
    const { container } = render(<CartLink count={137} />);

    expect(container.querySelector('[data-icon="cart-active"]')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('137');
  });
});
