import { render, screen } from '@testing-library/react';

import { ProductGridSkeleton } from './ProductGridSkeleton';

describe('ProductGridSkeleton', () => {
  it('stays out of the accessibility tree', () => {
    render(<ProductGridSkeleton />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('draws the outline of the cards without any of their content', () => {
    const { container } = render(<ProductGridSkeleton />);

    expect(container.querySelectorAll('li').length).toBeGreaterThan(0);
    expect(container).toHaveTextContent('');
    expect(container.querySelector('a, button, img, input')).not.toBeInTheDocument();
  });
});
