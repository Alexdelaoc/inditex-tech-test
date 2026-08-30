'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, useTransition } from 'react';

import { useLoadingIndicator } from './useLoadingIndicator';

import type { ReactNode } from 'react';

interface NavigationValue {
  isLoading: boolean;
  navigate: (href: string) => void;
}

export const NavigationContext = createContext<NavigationValue>({
  isLoading: false,
  navigate: () => {},
});

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isLoading = useLoadingIndicator(isPending);

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => router.replace(href));
    },
    [router],
  );

  const value = useMemo(() => ({ isLoading, navigate }), [isLoading, navigate]);

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  return useContext(NavigationContext);
}
