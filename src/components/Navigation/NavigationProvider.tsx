'use client';

import { useRouter } from 'next/navigation';
import { createContext, use, useCallback, useMemo, useState, useTransition } from 'react';

import { useLoadingIndicator } from './useLoadingIndicator';

import type { ReactNode } from 'react';

interface NavigationValue {
  isLoading: boolean;
  navigate: (href: string) => void;
  reportLinkPending: (pending: boolean) => void;
}

export const NavigationContext = createContext<NavigationValue>({
  isLoading: false,
  navigate: () => {},
  reportLinkPending: () => {},
});

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [linkPending, setLinkPending] = useState(false);
  const isLoading = useLoadingIndicator(isPending || linkPending);

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => router.replace(href));
    },
    [router],
  );

  const reportLinkPending = useCallback((pending: boolean) => {
    setLinkPending(pending);
  }, []);

  const value = useMemo(
    () => ({ isLoading, navigate, reportLinkPending }),
    [isLoading, navigate, reportLinkPending],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  return use(NavigationContext);
}
