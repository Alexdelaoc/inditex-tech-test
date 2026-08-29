import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SearchBar } from './SearchBar';

const replace = jest.fn();
let currentParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: (url: string) => replace(url) }),
  useSearchParams: () => currentParams,
}));

function setup() {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<SearchBar resultsCount={0} />);

  return user;
}

describe('SearchBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    currentParams = new URLSearchParams();
    replace.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders a search landmark', () => {
    setup();

    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('renders a labelled text box', () => {
    setup();

    expect(screen.getByRole('searchbox', { name: /search/i })).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('type', 'submit');
  });

  it('shows how many results are being displayed', () => {
    jest.useRealTimers();
    render(<SearchBar resultsCount={19} />);

    expect(screen.getByText('19 results')).toBeInTheDocument();
  });

  it('keeps the singular in agreement when there is a single result', () => {
    jest.useRealTimers();
    render(<SearchBar resultsCount={1} />);

    expect(screen.getByText('1 result')).toBeInTheDocument();
  });

  it('starts with the term that is already in the url', () => {
    currentParams = new URLSearchParams('search=samsung');
    setup();

    expect(screen.getByRole('searchbox')).toHaveValue('samsung');
  });

  it('writes the term into the url once the user stops typing', async () => {
    const user = setup();

    await user.type(screen.getByRole('searchbox'), 'samsung');
    expect(replace).not.toHaveBeenCalled();

    jest.runAllTimers();

    expect(replace).toHaveBeenCalledWith('/?search=samsung');
  });

  it('drops the term from the url when the box is emptied', async () => {
    currentParams = new URLSearchParams('search=samsung');
    const user = setup();

    await user.clear(screen.getByRole('searchbox'));
    jest.runAllTimers();

    expect(replace).toHaveBeenCalledWith('/');
  });

  it('offers no clear button while the box is empty', () => {
    setup();

    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it('empties the box and the url from the clear button', async () => {
    currentParams = new URLSearchParams('search=samsung');
    const user = setup();

    await user.click(screen.getByRole('button', { name: /clear/i }));
    jest.runAllTimers();

    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('searches straight away when the form is submitted', async () => {
    const user = setup();

    await user.type(screen.getByRole('searchbox'), 'oppo');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(replace).toHaveBeenCalledWith('/?search=oppo');
  });

  it('submits to the home page so the search also works without javascript', () => {
    setup();

    const form = screen.getByRole('search');

    expect(form).toHaveAttribute('action', '/');
    expect(form).toHaveAttribute('method', 'get');
    expect(screen.getByRole('searchbox')).toHaveAttribute('name', 'search');
  });
});
