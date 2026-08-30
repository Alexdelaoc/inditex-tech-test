import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NavigationProvider, useNavigation } from './NavigationProvider';

const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: (href: string) => replace(href) }),
}));

function Consumer() {
  const { navigate, isLoading } = useNavigation();

  return (
    <button type="button" onClick={() => navigate('/?search=oppo')}>
      {isLoading ? 'navigating' : 'idle'}
    </button>
  );
}

describe('NavigationProvider', () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it('starts idle', () => {
    render(
      <NavigationProvider>
        <Consumer />
      </NavigationProvider>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('idle');
  });

  it('sends the consumer to the requested url', async () => {
    render(
      <NavigationProvider>
        <Consumer />
      </NavigationProvider>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(replace).toHaveBeenCalledWith('/?search=oppo');
  });
});
