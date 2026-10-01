import { render, screen } from '@testing-library/react';

import { LoadingBar } from './LoadingBar';

describe('LoadingBar', () => {
  it('tells assistive technology that something is loading', () => {
    render(<LoadingBar />);

    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
  });

  it('does not pretend to know how far along the load is', () => {
    render(<LoadingBar />);

    const progressbar = screen.getByRole('progressbar');

    expect(progressbar).not.toHaveAttribute('aria-valuenow');
    expect(progressbar).not.toHaveAttribute('aria-valuemax');
  });
});
