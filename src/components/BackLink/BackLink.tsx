import Link from 'next/link';

import { Icon } from '@/components/Icon/Icon';
import { LinkProgress } from '@/components/Navigation/LinkProgress';

import styles from './BackLink.module.scss';

export function BackLink() {
  return (
    <div className={styles.bar}>
      <Link href="/" className={styles.link}>
        <LinkProgress />
        <Icon name="chevron-left" />
        Back
      </Link>
    </div>
  );
}
