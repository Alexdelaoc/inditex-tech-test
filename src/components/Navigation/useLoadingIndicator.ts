import { useEffect, useRef, useState } from 'react';

export const SHOW_AFTER_MS = 150;
export const MIN_VISIBLE_MS = 400;

export function useLoadingIndicator(isPending: boolean) {
  const [isLoading, setIsLoading] = useState(false);
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    if (isPending) {
      const timeout = setTimeout(() => {
        shownAt.current = Date.now();
        setIsLoading(true);
      }, SHOW_AFTER_MS);

      return () => clearTimeout(timeout);
    }

    if (shownAt.current === null) {
      return;
    }

    const remaining = MIN_VISIBLE_MS - (Date.now() - shownAt.current);
    const timeout = setTimeout(
      () => {
        shownAt.current = null;
        setIsLoading(false);
      },
      Math.max(remaining, 0),
    );

    return () => clearTimeout(timeout);
  }, [isPending]);

  return isLoading;
}
