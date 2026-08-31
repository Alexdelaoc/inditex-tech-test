'use client';

import { useLinkStatus } from 'next/link';
import { useEffect } from 'react';

import { useNavigation } from './NavigationProvider';

export function LinkProgress() {
  const { pending } = useLinkStatus();
  const { reportLinkPending } = useNavigation();

  useEffect(() => {
    if (!pending) {
      return;
    }

    reportLinkPending(true);

    return () => reportLinkPending(false);
  }, [pending, reportLinkPending]);

  return null;
}
