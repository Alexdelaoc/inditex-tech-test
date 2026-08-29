import { render } from '@testing-library/react';

import { Icon } from './Icon';

function renderIcon(...args: Parameters<typeof Icon>) {
  const { container } = render(<Icon {...args[0]} />);
  const svg = container.querySelector('svg');

  if (!svg) {
    throw new Error('No svg was rendered');
  }

  return svg;
}

describe('Icon', () => {
  it('renders the viewBox of the requested icon', () => {
    expect(renderIcon({ name: 'logo' })).toHaveAttribute('viewBox', '0 0 77 29');
    expect(renderIcon({ name: 'cart' })).toHaveAttribute('viewBox', '0 0 18 18');
  });

  it('renders a different shape for each cart state', () => {
    const empty = renderIcon({ name: 'cart' }).innerHTML;
    const active = renderIcon({ name: 'cart-active' }).innerHTML;

    expect(empty).not.toEqual(active);
  });

  it('inherits the colour from its container', () => {
    expect(renderIcon({ name: 'cart' })).toHaveAttribute('fill', 'currentColor');
  });

  it('is hidden from assistive technology', () => {
    expect(renderIcon({ name: 'cart' })).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards the class name so it can be styled by its container', () => {
    expect(renderIcon({ name: 'logo', className: 'custom' })).toHaveClass('custom');
  });
});
