import { render } from '@testing-library/react';

import { ProductConfiguratorSkeleton } from './ProductConfiguratorSkeleton';

describe('ProductConfiguratorSkeleton', () => {
  it('stays out of the accessibility tree', () => {
    const { container } = render(<ProductConfiguratorSkeleton />);

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws the outline of the product without any of its content', () => {
    const { container } = render(<ProductConfiguratorSkeleton />);

    expect(container).toHaveTextContent('');
    expect(container.querySelector('a, button, img, input, h1')).not.toBeInTheDocument();
  });
});
