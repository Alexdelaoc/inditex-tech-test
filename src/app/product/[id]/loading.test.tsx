import { render, screen } from '@testing-library/react';

import Loading from './loading';

describe('product page loading state', () => {
  it('announces that the product is loading', () => {
    render(<Loading />);

    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
  });

  it('keeps the way back to the catalogue usable while it waits', () => {
    render(<Loading />);

    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/');
  });

  it('does not expose anything else until the product arrives', () => {
    render(<Loading />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
