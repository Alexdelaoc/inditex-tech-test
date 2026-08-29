import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ErrorPage from './error';

describe('ErrorPage', () => {
  it('explains that something failed', () => {
    render(<ErrorPage error={new Error('boom')} reset={jest.fn()} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Something went wrong');
  });

  it('does not leak the underlying error to the user', () => {
    render(<ErrorPage error={new Error('Invalid API key')} reset={jest.fn()} />);

    expect(screen.queryByText(/Invalid API key/)).not.toBeInTheDocument();
  });

  it('retries the render when the button is pressed', async () => {
    const reset = jest.fn();
    render(<ErrorPage error={new Error('boom')} reset={reset} />);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
