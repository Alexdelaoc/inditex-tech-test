import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SearchBar } from './SearchBar';

const replace = jest.fn();
let currentParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => currentParams,
}));

jest.mock('@/modules/products/ResultsCount/ResultsCount', () => ({
  ResultsCount: () => null,
}));

function setup() {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const view = render(<SearchBar products={Promise.resolve([])} />);

  return { user, ...view };
}

function waitForDebounce() {
  act(() => jest.runOnlyPendingTimers());
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

  describe('structure', () => {
    it('is a search landmark with a labelled search box', () => {
      setup();

      expect(screen.getByRole('search')).toBeInTheDocument();
      expect(screen.getByRole('searchbox', { name: /search/i })).toBeInTheDocument();
    });

    it('submits to the home page with a search parameter, so it works without javascript', () => {
      setup();

      const form = screen.getByRole('search');

      expect(form).toHaveAttribute('action', '/');
      expect(form).toHaveAttribute('method', 'get');
      expect(screen.getByRole('searchbox')).toHaveAttribute('name', 'search');
      expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('type', 'submit');
    });

    it('starts from the term already in the url', () => {
      currentParams = new URLSearchParams('search=galaxy s24');
      setup();

      expect(screen.getByRole('searchbox')).toHaveValue('galaxy s24');
    });
  });

  describe('searching while typing', () => {
    it('waits until the shopper stops typing before searching', async () => {
      const { user } = setup();

      await user.type(screen.getByRole('searchbox'), 'samsung');

      expect(replace).not.toHaveBeenCalled();

      waitForDebounce();

      expect(replace).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith('/?search=samsung');
    });

    it('searches once for a burst of keystrokes, with the final term', async () => {
      const { user } = setup();
      const box = screen.getByRole('searchbox');

      await user.type(box, 'sam');
      await user.type(box, 'sung');
      await user.type(box, '{backspace}{backspace}');
      waitForDebounce();

      expect(replace).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith('/?search=samsu');
    });

    it('encodes characters that are not safe in a url', async () => {
      const { user } = setup();

      await user.type(screen.getByRole('searchbox'), 'galaxy s24+ & co');
      waitForDebounce();

      expect(replace).toHaveBeenCalledWith('/?search=galaxy+s24%2B+%26+co');
    });

    it('ignores surrounding whitespace', async () => {
      const { user } = setup();

      await user.type(screen.getByRole('searchbox'), '   pixel   ');
      waitForDebounce();

      expect(replace).toHaveBeenCalledWith('/?search=pixel');
    });

    it('goes back to the full catalogue when only whitespace is left', async () => {
      currentParams = new URLSearchParams('search=pixel');
      const { user } = setup();
      const box = screen.getByRole('searchbox');

      await user.clear(box);
      await user.type(box, '   ');
      waitForDebounce();

      expect(replace).toHaveBeenLastCalledWith('/');
    });

    it('goes back to the full catalogue when the box is emptied', async () => {
      currentParams = new URLSearchParams('search=pixel');
      const { user } = setup();

      await user.clear(screen.getByRole('searchbox'));
      waitForDebounce();

      expect(replace).toHaveBeenCalledWith('/');
    });

    it('drops a pending search when it is no longer on screen', async () => {
      const { user, unmount } = setup();

      await user.type(screen.getByRole('searchbox'), 'samsung');
      unmount();
      waitForDebounce();

      expect(replace).not.toHaveBeenCalled();
    });
  });

  describe('submitting', () => {
    it('searches straight away, without waiting', async () => {
      const { user } = setup();

      await user.type(screen.getByRole('searchbox'), 'oppo{enter}');

      expect(replace).toHaveBeenCalledWith('/?search=oppo');
    });

    it('does not search a second time once the wait runs out', async () => {
      const { user } = setup();

      await user.type(screen.getByRole('searchbox'), 'oppo{enter}');
      waitForDebounce();

      expect(replace).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearing', () => {
    it('only offers to clear when there is something to clear', async () => {
      const { user } = setup();

      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();

      await user.type(screen.getByRole('searchbox'), 'a');

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('empties the box and goes back to the full catalogue', async () => {
      currentParams = new URLSearchParams('search=samsung');
      const { user } = setup();

      await user.click(screen.getByRole('button', { name: /clear/i }));
      waitForDebounce();

      expect(screen.getByRole('searchbox')).toHaveValue('');
      expect(replace).toHaveBeenCalledWith('/');
    });
  });
});
