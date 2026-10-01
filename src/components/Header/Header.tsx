import Link from 'next/link';

import { Icon } from '@/components/Icon/Icon';

import { HeaderCartLink } from './HeaderCartLink';

import styles from './Header.module.scss';

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.link} aria-label="Zara Web Challenge, go to home">
        <Icon name="logo" className={styles.logo} />
      </Link>

      <HeaderCartLink />
    </header>
  );
}
