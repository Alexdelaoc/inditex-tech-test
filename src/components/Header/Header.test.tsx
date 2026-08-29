import { render, screen } from '@testing-library/react';

import { Header } from './Header';

describe('Header', () => {
  it('links the logo to the home page', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
  });

  it('links to the cart', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: /cart/i })).toHaveAttribute('href', '/cart');
  });

  it('shows the empty cart icon and a zero counter when the cart is empty', () => {
    const { container } = render(<Header cartCount={0} />);

    expect(container.querySelector('[data-icon="cart"]')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows the filled cart icon and the counter when there are products', () => {
    const { container } = render(<Header cartCount={3} />);

    expect(container.querySelector('[data-icon="cart-active"]')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('announces how many products the cart holds', () => {
    render(<Header cartCount={1} />);

    expect(screen.getByRole('link', { name: 'Cart, 1 product' })).toBeInTheDocument();
  });

  it('announces an empty cart', () => {
    render(<Header cartCount={0} />);

    expect(screen.getByRole('link', { name: 'Cart, 0 products' })).toBeInTheDocument();
  });
});
