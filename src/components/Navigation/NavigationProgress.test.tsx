import { render } from '@testing-library/react';

import { NavigationProgress } from './NavigationProgress';
import { NavigationContext } from './NavigationProvider';

function renderTrack(isLoading: boolean) {
  const { container } = render(
    <NavigationContext.Provider
      value={{ isLoading, navigate: jest.fn(), reportLinkPending: jest.fn() }}
    >
      <NavigationProgress />
    </NavigationContext.Provider>,
  );

  const track = container.querySelector('[data-loading]');

  if (!track) {
    throw new Error('No track was rendered');
  }

  return track;
}

describe('NavigationProgress', () => {
  it('stays quiet while nothing is loading', () => {
    expect(renderTrack(false)).toHaveAttribute('data-loading', 'false');
  });

  it('runs while a navigation is in flight', () => {
    expect(renderTrack(true)).toHaveAttribute('data-loading', 'true');
  });

  it('is hidden from assistive technology', () => {
    expect(renderTrack(false)).toHaveAttribute('aria-hidden', 'true');
  });
});
