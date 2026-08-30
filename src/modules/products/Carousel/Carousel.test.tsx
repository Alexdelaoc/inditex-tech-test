import { fireEvent, render, screen } from '@testing-library/react';

import { Carousel } from './Carousel';

function measure(track: HTMLElement, scrollWidth: number, clientWidth: number) {
  Object.defineProperty(track, 'scrollWidth', { value: scrollWidth, configurable: true });
  Object.defineProperty(track, 'clientWidth', { value: clientWidth, configurable: true });
}

function scrollTrack(scrollLeft: number) {
  const track = screen.getByRole('list');

  measure(track, 1000, 500);
  fireEvent.scroll(track, { target: { scrollLeft } });

  return track.nextElementSibling?.firstElementChild as HTMLElement;
}

describe('Carousel', () => {
  beforeEach(() => {
    render(
      <Carousel>
        <li>One</li>
        <li>Two</li>
      </Carousel>,
    );
  });

  it('lays its children out in a list', () => {
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('moves the indicator as far as the carousel has been scrolled', () => {
    expect(scrollTrack(0)).toHaveStyle({ left: '0%' });
    expect(scrollTrack(250)).toHaveStyle({ left: '50%' });
    expect(scrollTrack(500)).toHaveStyle({ left: '100%' });
  });

  it('keeps the indicator inside the bar at the far end', () => {
    expect(scrollTrack(500)).toHaveStyle({ transform: 'translateX(-100%)' });
  });

  it('hides the indicator from assistive technology, since the list is already reachable', () => {
    expect(screen.getByRole('list').nextElementSibling).toHaveAttribute('aria-hidden', 'true');
  });
});
