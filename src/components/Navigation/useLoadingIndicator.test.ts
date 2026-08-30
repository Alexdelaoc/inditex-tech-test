import { act, renderHook } from '@testing-library/react';

import { MIN_VISIBLE_MS, SHOW_AFTER_MS, useLoadingIndicator } from './useLoadingIndicator';

function renderIndicator(pending: boolean) {
  return renderHook(({ isPending }) => useLoadingIndicator(isPending), {
    initialProps: { isPending: pending },
  });
}

describe('useLoadingIndicator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts off', () => {
    expect(renderIndicator(false).result.current).toBe(false);
  });

  it('stays off when the wait is too short to be worth showing', () => {
    const { result, rerender } = renderIndicator(true);

    act(() => jest.advanceTimersByTime(SHOW_AFTER_MS - 1));
    rerender({ isPending: false });
    act(() => jest.runAllTimers());

    expect(result.current).toBe(false);
  });

  it('turns on once the wait passes the threshold', () => {
    const { result } = renderIndicator(true);

    act(() => jest.advanceTimersByTime(SHOW_AFTER_MS));

    expect(result.current).toBe(true);
  });

  it('stays on for a minimum once it has appeared', () => {
    const { result, rerender } = renderIndicator(true);

    act(() => jest.advanceTimersByTime(SHOW_AFTER_MS));
    rerender({ isPending: false });

    act(() => jest.advanceTimersByTime(MIN_VISIBLE_MS - 1));
    expect(result.current).toBe(true);

    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe(false);
  });

  it('turns on again for a second wait', () => {
    const { result, rerender } = renderIndicator(true);

    act(() => jest.advanceTimersByTime(SHOW_AFTER_MS));
    rerender({ isPending: false });
    act(() => jest.advanceTimersByTime(MIN_VISIBLE_MS));

    rerender({ isPending: true });
    act(() => jest.advanceTimersByTime(SHOW_AFTER_MS));

    expect(result.current).toBe(true);
  });
});
