import styles from './ProductConfigurator.module.scss';

import type { ReactNode } from 'react';

interface OptionGroupProps {
  id: string;
  legend: string;
  children: ReactNode;
}

export function OptionGroup({ id, legend, children }: OptionGroupProps) {
  return (
    <div role="group" aria-labelledby={id} className={styles.group}>
      <p id={id} className={styles.legend}>
        {legend}
      </p>
      {children}
    </div>
  );
}
