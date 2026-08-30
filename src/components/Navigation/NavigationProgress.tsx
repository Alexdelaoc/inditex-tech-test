'use client';

import { useNavigation } from './NavigationProvider';

import styles from './NavigationProgress.module.scss';

export function NavigationProgress() {
  const { isLoading } = useNavigation();

  return (
    <div className={styles.track} data-loading={isLoading} aria-hidden="true">
      <div className={styles.bar} />
    </div>
  );
}
