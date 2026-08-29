import { render, screen } from '@testing-library/react';

import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders a search landmark', () => {
    render(<SearchBar resultsCount={0} />);

    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('renders a labelled text box', () => {
    render(<SearchBar resultsCount={0} />);

    expect(screen.getByRole('searchbox', { name: /search/i })).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    render(<SearchBar resultsCount={0} />);

    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('type', 'submit');
  });

  it('shows how many results are being displayed', () => {
    render(<SearchBar resultsCount={19} />);

    expect(screen.getByText('19 results')).toBeInTheDocument();
  });

  it('keeps the singular in agreement when there is a single result', () => {
    render(<SearchBar resultsCount={1} />);

    expect(screen.getByText('1 result')).toBeInTheDocument();
  });
});
