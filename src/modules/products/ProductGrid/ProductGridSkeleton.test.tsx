import { render, screen } from '@testing-library/react';

import { ProductGridSkeleton } from './ProductGridSkeleton';

describe('ProductGridSkeleton', () => {
  it('stays out of the accessibility tree', () => {
    render(<ProductGridSkeleton />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('holds the space of the cards the listing asks for', () => {
    const { container } = render(<ProductGridSkeleton />);

    expect(container.querySelectorAll('li')).toHaveLength(20);
  });
});
