import Link from 'next/link';

import { Icon } from '@/components/Icon/Icon';

import styles from './BackLink.module.scss';

export function BackLink() {
  return (
    <div className={styles.bar}>
      <Link href="/" className={styles.link}>
        <Icon name="chevron-left" />
        Back
      </Link>
    </div>
  );
}
